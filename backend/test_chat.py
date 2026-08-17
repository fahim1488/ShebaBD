import urllib.request
import json

url = "http://localhost:8000/api/v1/chat/stream"
data = json.dumps({"message": "hello"}).encode()
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print("STATUS:", resp.status)
        for line in resp:
            decoded = line.decode().strip()
            if decoded:
                print(decoded)
except Exception as e:
    print("ERROR:", e)
