-- Only the first (screen + audio) list is eligible. The audio-only list is excluded.
-- Never ask for a password here: System Settings owns authentication.
on screenToggle(targetLabel)
  tell application "System Events"
    tell process "System Settings"
      repeat with settingsWindow in windows
        try
          -- SwiftUI System Settings layout, verified on macOS 27.
          set screenList to outline 1 of scroll area 1 of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1 of settingsWindow
          repeat with screenRow in rows of screenList
            repeat with candidateToggle in checkboxes of UI element 1 of screenRow
              if name of candidateToggle is targetLabel then return contents of candidateToggle
            end repeat
          end repeat
        end try
      end repeat
    end tell
  end tell
  return missing value
end screenToggle

on run arguments
  if (count of arguments) < 1 then error "需要准确的 App 文件名。"
  set targetLabel to item 1 of arguments
  set inspectOnly to (count of arguments) > 1 and item 2 of arguments is "--inspect"
  if not inspectOnly then tell application "System Settings" to activate
  repeat 20 times
    set targetToggle to my screenToggle(targetLabel)
    if targetToggle is not missing value then
      tell application "System Events"
        set currentValue to value of targetToggle
        if inspectOnly then return targetLabel & ": " & (currentValue as text)
        if currentValue is 1 then return "系统开关已经开启，继续用 Shiin 实测。"
        if currentValue is not 0 then error "开关状态无法确认，未执行点击。"
        click targetToggle
      end tell
      return "已请求开启 " & targetLabel & " 的屏幕录制权限。"
    end if
    delay 0.5
  end repeat
  error "未找到录屏列表中的 " & targetLabel & "。请确认系统设置页面及宿主名称。"
end run
