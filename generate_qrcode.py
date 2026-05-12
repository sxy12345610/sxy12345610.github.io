import qrcode
import os

# 获取本机 IP 地址作为访问地址
import socket

def get_local_ip():
    """获取本机局域网 IP 地址"""
    try:
        # 创建一个 socket 连接来获取本机 IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return 'localhost'

# 获取本机 IP
local_ip = get_local_ip()
# 构建访问 URL
url = f'http://{local_ip}:8000/index.html'

print(f"生成二维码的 URL: {url}")

# 生成二维码
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=2,
)

qr.add_data(url)
qr.make(fit=True)

# 创建二维码图片
img = qr.make_image(fill_color="#5d4e6d", back_color="white")

# 保存图片
save_path = os.path.join(os.path.dirname(__file__), 'qrcode.png')
img.save(save_path)

print(f"二维码已保存到：{save_path}")
print(f"手机扫码访问地址：{url}")
print(f"\n如果手机无法访问，请确保：")
print(f"1. 手机和电脑在同一局域网（连接同一个 WiFi）")
print(f"2. 电脑防火墙允许 8000 端口访问")
print(f"3. 或者使用公网 IP 替换 {local_ip}")
