## db 設計

```
{
"key": "fdd51a117f784c8487a43abed0d9fd34",
"value": [
{ "ip": "192.168.1.1", "takara": [1, 2, 3] },
{ "ip": "203.0.113.45", "takara": [4, 5, 6] },
{ "ip": "10.0.0.1", "takara": [10, 11, 12] },
{ "ip": "198.51.100.10","takara": [13, 14, 15] }
]
}
```

## sever

###　 endpoint

API を叩く際に IP アドレスを送る。その IP アドレスで検索を行う。
DB に対応するカラム名は ip

#### /list

ip で検索を行い、takara:number[]を全て返す。

#### /add/:id

takara の id を追加する。

#### /listAll

全ての value を返す

#### /deleteAll

全ての value を削除する
