const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

//não esquecer do npm install todas dependências acima

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/menu.html');
});

app.get('/cadastro', (req, res) => {
  res.sendFile(__dirname + '/static/cad_add_form.html');
});

app.get('/remover', (req, res) => {
  res.sendFile(__dirname + '/static/cad_del_form.html');
});

app.get('/usuarios', (req, res) => {
  res.sendFile(__dirname + '/static/cad_list_atrib.html');
});

app.get('/consulta', (req, res) => {
  res.sendFile(__dirname + '/static/cad_list_form.html');
});

app.get('/cadwhere', (req, res) => {
  res.sendFile(__dirname + '/static/cad_where_form.html');
});



// Rota para inserir um novo usuário
app.post('/submit_add', upload.single('image'), (req, res) => {
  const { name, password, phone } = req.body;
  const image = req.file.filename;

  const sql = "INSERT INTO usuario (nome, senha, telefone, imagem) VALUES (?, ?, ?, ?)";
  con.query(sql, [name, password, phone, image], function (err, result) {
    if (err) throw err;
    res.send("Cadastro realizado com sucesso!");
  });
});


app.get('/listtodos', (req, res) => {
  const sql = "SELECT * FROM usuario";
  con.query(sql, function (err, result) {
      if (err) throw err;

      let tableHtml = '<h1>Registros de Usuários</h1><table border="1"><tr><th>ID</th><th>Nome</th><th>Senha</th><th>Telefone</th><th>Imagem</th></tr>';
      result.forEach(user => {
          tableHtml += `<tr><td>${user.id}</td><td>${user.nome}</td><td>${user.senha}</td><td>${user.telefone}</td><td><img src="/uploads/${user.imagem}" alt="${user.nome}" width="100"></td></tr>`;
      });
      tableHtml += '</table>';

      res.send(tableHtml);
  });
});


// Rota para listar todos os usuários e permitir atualização
app.get('/list_update', (req, res) => {
  const sql = "SELECT * FROM usuario";
  con.query(sql, (err, result) => {
    if (err) throw err;

    let formHtml = `
      <h1>Lista de Usuários</h1>
      <table border="1">
        <tr><th>ID</th><th>Nome</th><th>Senha</th><th>Telefone</th><th>Imagem</th><th>Atualizar</th></tr>
    `;

    result.forEach(user => {
      formHtml += `
        <tr>
          <form action="/submit_update" method="POST" enctype="multipart/form-data">
            <td><input type="hidden" name="id" value="${user.id}">${user.id}</td>
            <td><input type="text" name="name" value="${user.nome}"></td>
            <td><input type="password" name="password" value="${user.senha}"></td>
            <td><input type="text" name="phone" value="${user.telefone}"></td>
            <td><img src="/uploads/${user.imagem}" width="100"><br><input type="file" name="image"></td>
            <td><button type="submit">Atualizar</button></td>
          </form>
        </tr>
      `;
    });

    formHtml += `</table>`;
    res.send(formHtml);
  });
});

app.get('/api/usuarios', (req, res) => {
  const sql = "SELECT * FROM usuario";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


app.post('/submit_where', (req, res) => {


  const { campo } = req.body;

  let sql;
  let queryParams = [];

  if (campo === "*") {
    sql = "SELECT * FROM usuario";
  } else {
    sql = "SELECT * FROM usuario WHERE id = ? OR nome = ? OR senha = ? OR telefone = ?";
    queryParams = [campo, campo, campo, campo];
  }

  console.log(sql);
  con.query(sql, queryParams, function (err, result) {
    if (err) throw err;
    let html = '<h1>Lista de Usuários</h1>';
    html += '<table border="1">';
    html += '<tr><th>ID</th><th>Nome</th><th>Senha</th><th>Telefone</th><th>Imagem</th></tr>';
    result.forEach(usuario => {
      html += `<tr><td>${usuario.id}</td><td>${usuario.nome}</td><td>${usuario.senha}</td><td>${usuario.telefone}</td><td><img src="/uploads/${usuario.imagem}" style="max-width:100px;max-height:100px;"></td></tr>`;
    });
    html += '</table>';
    res.send(html);
  });
});




// Rota para atualizar um usuário existente
app.post('/submit_update', upload.single('image'), (req, res) => {
  const { id, name, password, phone } = req.body;
  let image = req.file ? req.file.filename : null;

  let sql = "UPDATE usuario SET nome = ?, senha = ?, telefone = ?";
  let params = [name, password, phone];

  if (image) {
    sql += ", imagem = ?";
    params.push(image);
  }

  sql += " WHERE id = ?";
  params.push(id);

  con.query(sql, params, function (err, result) {
    if (err) throw err;
    //res.send("Usuário atualizado com sucesso!");
    res.sendFile(__dirname + '/static/cad_list_form.html');
  });
});

// Rota para deletar um usuário
app.post('/submit_del', (req, res) => {
  const { id } = req.body;

  const sql = "DELETE FROM usuario WHERE id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) throw err;
    res.send("Usuário removido com sucesso!");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
