const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const dadosLocais = JSON.parse(fs.readFileSync("dados.json"));

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).send("Você deve definir email e senha(password)");
  }

  const usuario = dadosLocais.find((user) => user.email === email);

  if (!usuario) {
    res.status(401).send("Email ou senha(password) inválidos");
  }

  if (!bcrypt.compareSync(password, usuario.hash)) {
    res.status(401).send("Email ou senha(password) inválidos");
  }

  res.status(200).send({
    email: usuario.email,
    name: usuario.name,
    dados: usuario.dados,
    token: usuario.token,
  });
});

router.post("/criar", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(422).send("Você deve definir email e senha(password)");
  } else if (
    dadosLocais.find(
      (usuario) => usuario.name === name || usuario.email === email
    )
  ) {
    res.status(401).send("Nome(name) ou email de usuário já está em uso");
  } else {
    var dadosUsuario = {
      id: Math.floor(Math.random() * 9999999999),
      name: name,
      email: email,
      dados: {},
    };
    const token = jwt.sign({ id: dadosUsuario.id }, "KEY_SECRETA");
    dadosUsuario.token = token;
    const salt = bcrypt.genSaltSync();
    dadosUsuario.hash = bcrypt.hashSync(password, salt);
    dadosLocais.push(dadosUsuario);
    const dadosConvertidos = JSON.stringify(dadosLocais, null, 2);
    fs.writeFileSync("dados.json", dadosConvertidos);
    res.status(200).send("OK");
  }
});

module.exports = router;
