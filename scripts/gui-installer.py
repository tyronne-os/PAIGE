#!/usr/bin/env python3
"""
WelcomeBackPage GUI Installer
Pinokio-style desktop application installer with GUI
"""

import sys
import os
import json
import subprocess
import platform
from pathlib import Path
from typing import Optional

try:
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog
    TK_AVAILABLE = True
except ImportError:
    TK_AVAILABLE = False


class InstallerUI:
    """GUI Installer for WelcomeBackPage"""
    
    def __init__(self):
        self.platform = platform.system()
        self.install_dir = self._get_default_install_dir()
        self.root: Optional[tk.Tk] = None
        self.progress = None
        self.log_text = None
        
    def _get_default_install_dir(self) -> str:
        """Get default installation directory based on platform"""
        home = Path.home()
        if self.platform == "Windows":
            return str(home / "AppData" / "Local" / "WelcomeBackPage")
        elif self.platform == "Darwin":  # macOS
            return str(home / ".local" / "share" / "WelcomeBackPage")
        else:  # Linux
            return str(home / ".local" / "share" / "WelcomeBackPage")
    
    def log(self, message: str, level: str = "info"):
        """Log message to UI"""
        prefix = {
            "info": "[INFO]",
            "success": "[✓]",
            "error": "[ERROR]",
            "warn": "[WARN]"
        }.get(level, "[LOG]")
        
        full_msg = f"{prefix} {message}\n"
        
        if self.log_text:
            self.log_text.insert(tk.END, full_msg)
            self.log_text.see(tk.END)
            self.root.update()
        else:
            print(full_msg, end="")
    
    def run_bash(self, cmd: str) -> bool:
        """Run bash command"""
        try:
            result = subprocess.run(
                ["bash", "-c", cmd],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.stdout:
                self.log(result.stdout.strip(), "info")
            
            if result.returncode != 0:
                self.log(f"Command failed: {result.stderr}", "error")
                return False
            
            return True
        except Exception as e:
            self.log(f"Error running command: {str(e)}", "error")
            return False
    
    def create_gui(self):
        """Create installer GUI"""
        if not TK_AVAILABLE:
            self.log("Tkinter not available, using CLI mode", "warn")
            return False
        
        self.root = tk.Tk()
        self.root.title("WelcomeBackPage Installer")
        self.root.geometry("600x500")
        self.root.resizable(False, False)
        
        # Header
        header = ttk.Frame(self.root)
        header.pack(fill=tk.X, padx=20, pady=20)
        
        title = ttk.Label(
            header,
            text="WelcomeBackPage",
            font=("Arial", 24, "bold")
        )
        title.pack()
        
        subtitle = ttk.Label(
            header,
            text="Personal AI Agent Workspace Installer",
            font=("Arial", 10)
        )
        subtitle.pack()
        
        # Installation directory
        dir_frame = ttk.LabelFrame(self.root, text="Installation Directory", padding=10)
        dir_frame.pack(fill=tk.X, padx=20, pady=10)
        
        ttk.Label(dir_frame, text="Install to:").pack(anchor=tk.W)
        
        dir_entry = ttk.Entry(dir_frame, width=50)
        dir_entry.insert(0, self.install_dir)
        dir_entry.pack(fill=tk.X, pady=5)
        
        def browse_dir():
            selected = filedialog.askdirectory(
                title="Select Installation Directory",
                initialdir=str(Path.home())
            )
            if selected:
                self.install_dir = selected
                dir_entry.delete(0, tk.END)
                dir_entry.insert(0, selected)
        
        ttk.Button(dir_frame, text="Browse", command=browse_dir).pack(pady=5)
        
        # Platform info
        info_frame = ttk.LabelFrame(self.root, text="System Information", padding=10)
        info_frame.pack(fill=tk.X, padx=20, pady=10)
        
        ttk.Label(info_frame, text=f"Platform: {self.platform}").pack(anchor=tk.W)
        ttk.Label(info_frame, text=f"Home: {Path.home()}").pack(anchor=tk.W)
        
        # Log area
        log_frame = ttk.LabelFrame(self.root, text="Installation Log", padding=10)
        log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.log_text = tk.Text(log_frame, height=10, width=70, state=tk.NORMAL)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(self.log_text)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.log_text.yview)
        
        # Progress bar
        self.progress = ttk.Progressbar(
            self.root,
            mode='indeterminate'
        )
        self.progress.pack(fill=tk.X, padx=20, pady=5)
        
        # Buttons
        button_frame = ttk.Frame(self.root)
        button_frame.pack(fill=tk.X, padx=20, pady=10)
        
        def install():
            self.progress.start()
            self.log("Starting installation...", "info")
            
            try:
                # Call the shell installer
                cmd = f"bash desktop-installer.sh '{self.install_dir}' install"
                if self.run_bash(cmd):
                    self.log("Installation completed successfully!", "success")
                    messagebox.showinfo(
                        "Success",
                        "WelcomeBackPage has been installed successfully!"
                    )
                else:
                    self.log("Installation failed", "error")
                    messagebox.showerror(
                        "Error",
                        "Installation failed. Check the log for details."
                    )
            except Exception as e:
                self.log(f"Installation error: {str(e)}", "error")
                messagebox.showerror("Error", f"Installation failed: {str(e)}")
            finally:
                self.progress.stop()
        
        ttk.Button(
            button_frame,
            text="Install",
            command=install
        ).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(
            button_frame,
            text="Quit",
            command=self.root.quit
        ).pack(side=tk.LEFT, padx=5)
        
        # Initial log message
        self.log(f"WelcomeBackPage Installer for {self.platform}", "info")
        self.log(f"Installation directory: {self.install_dir}", "info")
        
        return True
    
    def run(self):
        """Run the installer"""
        if self.create_gui():
            self.root.mainloop()
        else:
            self.log("GUI not available, please use CLI", "warn")


def main():
    """Main entry point"""
    installer = InstallerUI()
    installer.run()


if __name__ == "__main__":
    main()
