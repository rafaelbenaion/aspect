# Aspect Server

O Aspect é um sistema que extraí medidas corporais. Para isso precisamos persistir em algum local estas medidas.

Este aplicativo é apenas um serviço de persistência das medidas.

As medidas são persistidas em `/measures` e o modelo têm o mesmo nome.

Dentro do model `Measure` têm apenas dois atributos JSON: `from` com informações da origem do usuário, e `set` com as medidas em si.

```ruby
m = Measure.last
m.set # => {"side"=>{"busto"=>"22.37", "altura"=>"51.63", "cintura"=>"27.9", "quadril"=>"27.9"}, "front"=>{"busto"=>"50.87", "altura"=>"82.87", "cintura"=>"49.85", "quadril"=>"49.85"}}
m.from # => {"email"=>"jonatasdp@gmail.com"}
```

# Setup do projeto

Baixe e instale as dependências no padrão Rails.

    git clone git@github.com:inventto/aspect-server.git
    cd aspect-server
    bundle install

Faça o setup do banco, criando o banco e rodando as migrações.

    rake db:{create,migrate}

Rode o servidor:

    rails s

O servidor rodando, teste ver se a api está ok!

    curl localhost:3000/measures.json # => []

