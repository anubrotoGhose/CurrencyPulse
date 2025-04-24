import requests

url = "http://localhost:8000/get-currency-info"
data = {
    "from_currency": "USD",
    "to_currency": "INR"
}
response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response Text:", response.text)