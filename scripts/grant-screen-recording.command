#!/bin/zsh
# Double-click, or run with --port 3817. Authentication belongs to macOS.
set -eu

task_root="${0:A:h:h}"
task_port="${SHIIN_WEB_PORT:-}"
task_app=""
task_check=0

usage() {
  cat <<'HELP'
Shiin 屏幕录制授权助手
  双击：自动寻找本仓库正在运行的 Shiin 服务及其宿主 App。
  --port 3817                 指定本机 Shiin 服务端口
  --app /Applications/X.app   明确指定宿主 App（可选）
  --check                     只检查，不打开设置或修改开关

只处理屏幕录制权限。密码由 macOS 原生验证窗口接收。
HELP
}

while (( $# )); do
  case "$1" in
    --port|--app)
      (( $# >= 2 )) || { usage; exit 2; }
      if [[ "$1" == --port ]]; then task_port="$2"; else task_app="$2"; fi
      shift 2 ;;
    --check) task_check=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) usage; exit 2 ;;
  esac
done

[[ "$OSTYPE" == darwin* ]] || { print -u2 '此助手只适用于 macOS。'; exit 2; }
task_server_pid=""
if [[ -z "$task_port" ]]; then
  # Match this checkout so another project cannot silently become the target.
  task_matches=()
  while read -r task_candidate; do
    [[ -n "$task_candidate" ]] || continue
    task_cwd=$(/usr/sbin/lsof -a -p "$task_candidate" -d cwd -Fn 2>/dev/null | /usr/bin/sed -n 's/^n//p')
    [[ "$task_cwd" == "$task_root" ]] && task_matches+=("$task_candidate")
  done < <(/bin/ps -axo pid=,args= | /usr/bin/awk '/[s]hiin.*serve|[c]li\.mjs serve/ {print $1}')
  if (( ${#task_matches} == 1 )); then
    task_server_pid="${task_matches[1]}"
    task_port=$(/usr/sbin/lsof -nP -a -p "$task_server_pid" -iTCP -sTCP:LISTEN -Fn 2>/dev/null | /usr/bin/sed -n 's/^n127\.0\.0\.1://p' | /usr/bin/head -1)
  else
    print -u2 '未找到唯一的本仓库 Shiin 服务；请先启动服务，或使用 --port 指定端口。'
    exit 2
  fi
fi
[[ "$task_port" == <1-65535> ]] || { print -u2 '端口必须在 1–65535 之间。'; exit 2; }
task_url="http://127.0.0.1:$task_port"
if [[ -z "$task_server_pid" ]]; then
  task_server_pid=$(/usr/sbin/lsof -nP -iTCP:"$task_port" -sTCP:LISTEN -t 2>/dev/null | /usr/bin/head -1)
fi
[[ -n "$task_server_pid" ]] || { print -u2 "端口 $task_port 上没有运行中的服务。"; exit 2; }

task_permissions() {
  /usr/bin/curl --fail --silent --show-error --connect-timeout 2 --max-time 8 "$task_url/api/permissions" |
    /usr/bin/plutil -extract screenCapture raw -o - -
}

if ! task_state=$(task_permissions); then
  print -u2 '无法读取 Shiin 权限接口，请确认端口。'
  exit 2
fi
if [[ "$task_state" == true ]]; then
  print '屏幕录制已通过 Shiin 实测，无需重复授权。'
  exit 0
fi

if [[ -z "$task_app" ]]; then
  task_parent="$task_server_pid"
  for task_depth in {1..20}; do
    [[ "$task_parent" == <2-> ]] || break
    task_executable=$(/bin/ps -ww -p "$task_parent" -o comm= | /usr/bin/sed 's/^[[:space:]]*//')
    if [[ "$task_executable" == /*.app/Contents/* ]]; then
      task_app="${task_executable%%.app/*}.app"
      break
    fi
    task_parent=$(/bin/ps -p "$task_parent" -o ppid= | /usr/bin/tr -d ' ')
  done
fi
[[ "$task_app" == /*.app && -f "$task_app/Contents/Info.plist" ]] || {
  print -u2 '无法确认服务宿主；请使用 --app 指定实际启动 Shiin 的 App。'
  exit 2
}
task_label="${task_app:t}"
print "授权对象：$task_app"
print "实测服务：$task_url"
if (( task_check )); then
  print '屏幕录制尚未通过实测。未更改系统权限。'
  exit 1
fi

/usr/bin/open 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture'
print '正在定位录屏开关；如出现身份验证，请在系统窗口输入密码或使用触控 ID。'
if ! task_action=$(/usr/bin/osascript "$task_root/scripts/screen-recording-toggle.applescript" "$task_label"); then
  print -u2 "无法自动操作设置。请在已打开的录屏列表中开启 $task_label，再运行此脚本复检。"
  exit 2
fi
print "$task_action"
print '等待 macOS 完成验证并检查 Shiin 的实际截图能力…'
for task_attempt in {1..90}; do
  if task_state=$(task_permissions) && [[ "$task_state" == true ]]; then
    print '授权成功：Shiin 后端实际捕获屏幕已通过。'
    exit 0
  fi
  /bin/sleep 2
done
print -u2 "实测尚未通过。若系统要求重新打开 $task_label，请先保存工作并重启它，再运行此脚本。"
exit 1
