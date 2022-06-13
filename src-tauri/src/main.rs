#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent};
use tauri::{RunEvent, WindowEvent};
use tauri::Manager;

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  let quit = CustomMenuItem::new("quit".to_string(), "종료");
  let menuitem_show_hide = CustomMenuItem::new("show_hide".to_string(), "숨기기");
  let tray_menu = SystemTrayMenu::new()
    .add_item(menuitem_show_hide)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

  #[allow(unused_mut)]
  let mut app = tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)]
      app.get_window("main").unwrap().open_devtools();

      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main").unwrap();

      // we perform the initialization code on a new task so the app doesn't freeze
      tauri::async_runtime::spawn(async move {
        // initialize your app here instead of sleeping :)
        println!("Initializing...");
        std::thread::sleep(std::time::Duration::from_secs(3));
        println!("Done initializing.");

        // After it's done, close the splashscreen and display the main window
        splashscreen_window.close().unwrap();
        main_window.show().unwrap();
      });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![handle_short_key, handle_quit])
    .system_tray(SystemTray::new().with_menu(tray_menu))
    .on_system_tray_event( move |app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a left click");
      }
      SystemTrayEvent::RightClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick {
        position: _,
        size: _,
        ..
      } => {
        println!("system tray received a double click");
      }
      SystemTrayEvent::MenuItemClick { id,  .. } => {
          let item_handle = app.tray_handle().get_item(&id);
          match id.as_str() {
            "quit" => {
              std::process::exit(0);
            }
            "show_hide" => {
              let window = app.get_window("main").unwrap();

              if window.is_visible().unwrap() {
                window.hide().unwrap();
                let _h = item_handle.set_title("보이기").unwrap();
                match window.eval("window['detectState']('hide')") {
                  Ok(_) => {},
                  Err(e) => {
                    println!("{:?}", e);
                  },
              };
              } else {
                window.show().unwrap();
                let _h = item_handle.set_title("숨기기").unwrap();
                match window.eval("window['detectState']('show')") {
                  Ok(_) => {},
                  Err(e) => {
                    println!("{:?}", e);
                  },
              };
              }
            }
            _ => {}
          }
      }
      _ => {}
    })
    .build(tauri::generate_context!())
    .expect("failed to run app");

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Regular);

    app.run(|app_handle, e| match e {

      // Triggered when a window is trying to close
      RunEvent::WindowEvent {
        label,
        event: WindowEvent::CloseRequested { api, .. },
        ..
      } => {
        let app_handle = app_handle.clone();
        api.prevent_close();

        std::thread::spawn(move || {
          app_handle.tray_handle().get_item("show_hide").set_title("보이기").unwrap();
          app_handle.get_window(&label).unwrap().hide().unwrap();
        });
      }

      // Keep the event loop running even if all windows are closed
      // This allow us to catch system tray events when there is no window
      RunEvent::ExitRequested { api, .. } => {
        api.prevent_exit();
      }
      _ => {}
    });
}

#[tauri::command]
fn handle_short_key(window: tauri::Window) {
  let app_handle = window.app_handle();
  std::thread::spawn(move || {
    if window.is_visible().unwrap() {
      window.hide().unwrap();
      app_handle.tray_handle().get_item("show_hide").set_title("보이기").unwrap();
      match window.eval("window['detectState']('hide')") {
          Ok(_) => {},
          Err(e) => {
            println!("{:?}", e);
          },
      };
    } else {
      window.show().unwrap();
      app_handle.tray_handle().get_item("show_hide").set_title("숨기기").unwrap();
      match window.eval("window['detectState']('show')") {
          Ok(_) => {},
          Err(e) => {
            println!("{:?}", e);
          },
      };
    }
  });
}

#[tauri::command]
fn handle_quit() {
  std::process::exit(0);
}
