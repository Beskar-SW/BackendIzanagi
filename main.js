import express, { json } from "express";
import mysql2 from "mysql2";
import fs from "fs";
import cors from "cors";
import "dotenv/config";
import multer from "multer";

const upload = multer();

var app = express();

app.use("/static", express.static("public"));
app.use(json());
app.use(cors());

app.get("/",(req,res)=>{

  res.status(200).json({
    message: "Welcome to the API"
  });
});

app.use("/Menu/:id", function (req, res) {
  var id = req.params.id;

  // config.application.cors.server

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "SELECT * FROM Productos WHERE idTipoProducto = ?",
    [+id],
    function (err, rows, fields) {
      if (err) throw err;
      // console.log(rows);
      res.json(rows);
    }
  );

  con.end();
});

app.get("/productos/:id", function (req, res) {
  var id = req.params.id;
  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "SELECT * FROM Productos WHERE idProducto = ?",
    [+id],
    function (err, rows, fields) {
      if (err) throw err;
      res.json(rows);
    }
  );

  con.end();
});

app.get("/Admin/:user/:pass", (req, res) => {
  var user = req.params.user;
  var pass = req.params.pass;

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "SELECT * FROM USERS WHERE usuario = ? and  contraseña = ?",
    [user, pass],
    (err, rows, fields) => {
      if (err) throw err;
      if (rows) {
        console.warn(`El usuario ${user} se conecto`);
        res.json(rows);
      } else {
        res.json({
          response: "no data",
        });
      }
    }
  );

  con.end();
});

app.delete("/Admin/delete/:id", (req, res) => {
  var id = req.params.id;
  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "DELETE FROM Productos WHERE idProducto = ?",
    [+id],
    (err, rows, fields) => {
      if (err) throw err;
    }
  );

  con.end();

  res.json({
    response: "ok",
  });
});

app.put("/Admin/update/:id", upload.any(),(req, res) => {
  var id = req.params.id;
  var data = req.body;
  var producto = data.producto;
  var precio = data.precio;
  var descripcion = data.descripcion;
  var imagen = req.files[0];
  var nombreFoto = imagen.originalname;


 //guardar la imagen en la carpeta public
  fs.writeFile(`public/${nombreFoto}`, imagen.buffer, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "UPDATE Productos SET producto = ?, precio = ?, descripcion = ?, rutaFoto = ? WHERE idProducto = ?",
    [producto, precio, descripcion, nombreFoto, +id],
    (err, rows, fields) => {
      if (err) throw err;
    }
  );

  con.end();

  res.status(200).json({
    response: "ok",
  });
});

app.post("/Admin/create", upload.any(),(req,res)=>{
  var data = req.body;
  var producto = data.producto;
  var precio = data.precio;
  var descripcion = data.descripcion;
  var imagen = req.files[0];
  var nombreFoto = imagen.originalname;
  var tipo = data.tipo;

  console.log(imagen)

  //guardar la imagen en la carpeta public
  fs.writeFile(`public/${nombreFoto}`, imagen.buffer, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  con.query(
    "INSERT INTO Productos (producto, precio, descripcion, rutaFoto, idTipoProducto) VALUES (?,?,?,?,?)",
    [producto, precio, descripcion, nombreFoto, +tipo],
    (err, rows, fields) => {
      if (err) throw err;
    }
  );
  con.end();

  res.status(200).json({
    response: "ok",
  });
});

app.post("/Admin/Pedidos", (req,res)=>{
  var pedido = req.body;

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(fecha);

  con.query("INSERT INTO Pedidos(fecha) values (?)", [fecha], (err, rows, fields) => {
    if (err) throw err;
  });

  con.query("Select idPedido from Pedidos where fecha = ?", [fecha], (err, rows, fields) => {
    if (err) throw err;
    var idPedido = rows[0].idPedido;
    con.query("INSERT INTO PedidosP(idPedido, idProducto, cantidad, nombrePersona) values (?,?,?,?)", [idPedido, +pedido.idProducto, +pedido.cantidad, idPedido.cliente], (err, rows, fields) => {
      if (err) throw err;
    });
  });

  con.end();

  res.status(200).json({
    response: "ok",
  });
});

app.post("Admin/Ventas", (req,res)=>{

  var productos = req.body.productos;

  var con = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Restaurant",
    port: 3306,
  });

  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(fecha);

  con.query("INSERT INTO Ventas(fecha) values (?)", [fecha], (err, rows, fields) => {
    if (err) throw err;
  });

  con.query("Select idVenta from Ventas where fecha = ?", [fecha], (err, rows, fields) => {
    if (err) throw err;
    var idVenta = rows[0].idVenta;
    for(var i = 0; i < productos.length; i++){
      con.query("INSERT INTO VentasP(idVenta, idProducto) values (?,?)", [idVenta, +productos[i].idProducto], (err, rows, fields) => {
        if (err) throw err;
      });
    }
  });

  con.end();

  res.status(200).json({
    response: "ok",
  });

});


app.listen(process.env.PORT || 3000, function () {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
