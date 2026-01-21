import http.server
import socketserver
import socket
import qrcode
import os
import sys

PORT = 8000

def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    # Install qrcode if not present (optional simple check)
    try:
        import qrcode
    except ImportError:
        print("QRCode library not found. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "qrcode[pil]"])
        import qrcode

    ip = get_ip_address()
    url = f"http://{ip}:{PORT}"
    
    print("\n" + "="*50)
    print(f" KidsTube Server Started!")
    print("="*50)
    print(f"\n PC (Local):   http://localhost:{PORT}")
    print(f" Smartphone:   {url}")
    print("\n" + "="*50)
    
    # Generate QR Code in terminal
    qr = qrcode.QRCode()
    qr.add_data(url)
    qr.make(fit=True)
    qr.print_ascii(invert=True)
    
    print("\nPress Ctrl+C to stop the server.")

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
