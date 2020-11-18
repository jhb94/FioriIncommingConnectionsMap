var express = require('express');
var Q = require('q');
const fs = require('fs');
var request = require('request');
var app = express();
//cheerio para actuar sobre documentos html
const cheerio = require('cheerio');
//GOT para llamar a documentos html
//const got = require('got');
app.use(express.static(__dirname + '/webapp')); 
var port = 3000; 

var oficinasInternas = JSON.parse(fs.readFileSync('webapp/oficinasInternas.json', 'utf8'));

const querystring = require('querystring');
const https = require('https');

// Prueba parseo json
const myParser = require("body-parser");
app.use(myParser.json());
app.use(myParser.urlencoded({ extended: true }));

var optionsICM = {
  'method': 'GET',
  'url': 'http://erp.idom.com/sap/wdisp/admin/icp/show_conns.icp',
  'headers': {
    'Authorization': 'Basic d2ViYWRtOklkb20yMDE3'
  }
};

var urlGeo = 'https://api.ipgeolocationapi.com/geolocate/';

var arrayIp = [];

//Bloque principal llamado desde el html
app.get('/CurrentIps', function (req, res) {

  const devolverIps = async () => {

    return new Promise(function(resolve, reject){
      request(optionsICM, function (error, response) {
        if (error) throw new Error(error);

        //Crear un modelo JSON con los campos Peer Address:Port del fichero ICM (Parsear HTML para coger las IPs)
        const $ = cheerio.load(response.body);
        
        var arrayIp = [];

        $('tr').each( (i, connection) => {

          if (connection.children[6] != undefined) {
            if (connection.children[13].childNodes[0].data !== undefined
              && connection.children[13].childNodes[0].data !== null) {

              var ip = connection.children[13].childNodes[0].data.replace(/\s/g, "");

              console.log(ip);
              arrayIp.push(ip);
  
            }
          }
        });
        resolve(arrayIp);  
      });
    });
  }

  const resolverLocalizacion = async (ip) => {
    //var urlGeo = 'https://api.ipgeolocationapi.com/geolocate/';
    var urlGeo = 'http://ip-api.com/json/';
    return new Promise(function(resolve, reject){

      request(urlGeo.concat(ip), function (error, response) {
        if (error) throw new Error(error);

        var configuracion = {
          "ip" : ip,
          //"Latitud": JSON.parse(response.body).geo.latitude,
          //"Longitud" : JSON.parse(response.body).geo.longitude,
          "Latitud": JSON.parse(response.body).lat,
          "Longitud" : JSON.parse(response.body).lon,
          "Tipo": "Remoto",
          //"Pais": JSON.parse(response.body).name,
          "Pais": JSON.parse(response.body).country + " " + JSON.parse(response.body).city,
          "Codigo" :JSON.parse(response.body).countryCode
          //"Codigo" :JSON.parse(response.body).un_locode
        };

        resolve(configuracion);  
      });
    });
  } 

  const chequearInternasExternas = async (arrayIp) => {

      var conexiones = [];

      for (var i = 0; i< arrayIp.length; i++){

        var posIp = oficinasInternas.OficinasInternas.map(function (e) {
          return e.Rango;
        }).indexOf(arrayIp[i].split(".")[0].concat(".").concat(arrayIp[i].split(".")[1]));

        if (posIp != -1) {

            var configuracion = {
              "ip": arrayIp[i].split(".")[0].concat(".").concat(arrayIp[i].split(".")[1]),
              "Latitud": oficinasInternas.OficinasInternas[posIp].Latitud,
              "Longitud": oficinasInternas.OficinasInternas[posIp].Longitud,
              "Tipo": "Oficina",
              "Pais":  oficinasInternas.OficinasInternas[posIp].Nombre,
              "Codigo" :""
            };

            conexiones[i] = configuracion;

        } else {

            var optionsGeoApi = {
              'method': 'GET',
              'url': urlGeo.concat(arrayIp[i].split(":")[0])
            };

            await resolverLocalizacion(arrayIp[i].split(":")[0]).
            then(function(conf) {
              console.log(conf);

              conexiones[i] = conf;
            }).catch(function(err) {
              console.err(err);
          });
        }  
        
      }    
      res.setHeader('Content-Type', 'application/json');

        res.end(
          JSON.stringify({
            conexiones
          })
        );

  }

  devolverIps().then(function(arrayIp) {
      console.log(arrayIp);
      chequearInternasExternas(arrayIp);
  }).catch(function(err) {
      console.err(err);
  });
});

app.listen(port, function () {
console.log('WEB server on ' + port + ", session started on: " + new Date());

});
