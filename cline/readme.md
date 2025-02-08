## db

sqllite

### table 構成

- id:number
- ip:string
- takara:number[]

## sever

###　 endpoint

API を叩く際に IP アドレスを送る。その IP アドレスで検索を行う。
DB に対応するカラム名は ip

#### /show

ip で検索を行い、takara:number[]を全て返す。

#### /add/:id

takara の id を ip に追加する

#### /test2

単純なテスト
