//----------------------------Date------------------------------------------------------
var dt = new Date();
document.getElementById("datetime").innerHTML =
  "Date: " + dt.toLocaleDateString();
//------------------------DYNAMIC CLOCK -------------------------------------------------
setInterval(showTime, 1000);

function showTime() {
  let time = new Date(); //to get current system date
  let hour = time.getHours(); //storing the current hours
  let min = time.getMinutes(); //storing current minutes
  let sec = time.getSeconds(); //storing current seconds
  am_pm = "AM"; //initializing to AM (as time is to be displayed in 12 hour system)
  // setting value of am_pm variable and hour (12 hour format) according to hour value
  if (hour > 12) {
    hour -= 12;
    am_pm = "PM";
  }
  if (hour == 0) {
    hr = 12;
    am_pm = "AM";
  }
  hour = hour < 10 ? "0" + hour : hour;
  min = min < 10 ? "0" + min : min;
  sec = sec < 10 ? "0" + sec : sec;
  //storing and displaying current time in hour:min:sec format
  let currentTime = "IST : " + hour + ":" + min + ":" + sec + " " + am_pm;
  document.getElementById("clock").innerHTML = currentTime;
}
showTime();

//*******************************MAP*********************************************

/////////////Ajax Requests////////////
$(document).ready(function () {
  // Fetch the initial Map
  refreshMap();
  // Fetch every 5.5 second
  setInterval(refreshMap, 5500);
});

function refreshMap() {
  var container = L.DomUtil.get("map");
  if (container != null) {
    container._leaflet_id = null;
  }
  //creating map in the 'map' div
  var map = L.map("map").setView([20.5937, 78.9629], 4);
  var jsonDataObject = [];
  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1q1ExDaPV-OBmVAfG2m07ZIo91fP4n2_LaOQ1L1wovAM/5/public/full?alt=json" +
      "&callback = ?",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        //storing json data in dictionary json_data for each entry i
        var json_data = {
          City: data.feed.entry[i].gsx$city.$t,
          OrderID: data.feed.entry[i].gsx$orderid.$t,
          DispatchStatus: data.feed.entry[i].gsx$orderdispatched.$t,
          ShippingStatus: data.feed.entry[i].gsx$ordershipped.$t,
          Latitude: parseFloat(data.feed.entry[i].gsx$latitude.$t),
          Longitude: parseFloat(data.feed.entry[i].gsx$longitude.$t)
        };
        //pushing data of json_data for i th entry into jsonDataObject as a whole
        jsonDataObject.push(json_data);
        for (var j = 0; j < jsonDataObject.length; j++) {
          //creating icons of 3 different colors :red,green,yellow
          //*************red***************
          var RIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -55],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            shadowSize: [41, 41]
          });
          //************yellow*****************
          var YIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -55],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            shadowSize: [41, 41]
          });
          //*************Green*******************
          var GIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -55],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            shadowSize: [41, 41]
          });
          //simply storing dispatch status and shipping status for current entry in variables respectively for simplicity of code
          var dispatch_status = jsonDataObject[j].DispatchStatus;
          var shipping_status = jsonDataObject[j].ShippingStatus;
          //assigning markers of different colors based on : 1. red- packets neither dispatched nor shipped 2. yellow-packets dispatched but not shipped 3. green- both dispatched and shipped
          if (dispatch_status === "YES") {
            if (shipping_status === "YES") {
              var myIcon = GIcon;
            } //3.
            else {
              var myIcon = YIcon;
            }
          } //2.
          else {
            var myIcon = RIcon;
          } //1.
          //marker variable below now represents the marker on map at given latitude and longitude position
          var marker = L.marker(
            L.latLng(
              parseFloat(jsonDataObject[j].Latitude),
              parseFloat(jsonDataObject[j].Longitude)
            ),
            {
              icon: myIcon
            }
          );
          //adding city popup
          marker.bindPopup(jsonDataObject[j].City, {
            closeOnClick: false,
            autoClose: false
          });
          //marker added to map
          map.addLayer(marker);
          //turning on the on-click feature for marker
          marker.on("click", onClick_Marker);
          //for better understanding of viewer
          if (jsonDataObject[j].DispatchStatus !== "YES") {
            jsonDataObject[j].DispatchStatus = "NO";
          }
          if (jsonDataObject[j].ShippingStatus !== "YES") {
            jsonDataObject[j].ShippingStatus = "NO";
          }
          // Attach the corresponding JSON data to your marker:
          marker.myJsonData = jsonDataObject[j];

          function onClick_Marker(e) {
            var marker = e.target;
            popup = L.popup({
              closeOnClick: false,
              autoClose: false
            })
              .setLatLng(marker.getLatLng())
              .setContent(
                "Order ID: " +
                  marker.myJsonData.OrderID +
                  " || Dispatched Status: " +
                  marker.myJsonData.DispatchStatus +
                  " || Shipped Status: " +
                  marker.myJsonData.ShippingStatus
              )
              .openOn(map);
          }
          //tile layer being added to map
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="http://osm.org/copyrighInclude Leaflet JavaScriptt">OpenStreetMap</a> contributors'
          }).addTo(map);
        }
      }
    }
  );
}

//************************CHART*************************
$(document).ready(function () {
  // Fetch the initial Chart
  refreshChart();
  // Fetch every 5.5 second
  setInterval(refreshChart, 5500);
});
google.charts.load("current", {
  packages: ["corechart"]
});
google.charts.setOnLoadCallback(refreshChart);

function refreshChart() {
  var jsonDataObject = [];
  var graph_arr = [
    [
      "Order ID",
      "Time Taken",
      {
        role: "style"
      },
      {
        role: "annotation"
      }
    ]
  ];
  var bar_color = [];
  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1q1ExDaPV-OBmVAfG2m07ZIo91fP4n2_LaOQ1L1wovAM/5/public/full?alt=json" +
      "&callback = ?",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        //storing json data in dictionary json_data for each entry i
        var json_data = {
          OderID: data.feed.entry[i].gsx$orderid.$t,
          TimeTaken: parseFloat(data.feed.entry[i].gsx$timetaken.$t),
          Priority: data.feed.entry[i].gsx$priority.$t
        };
        //pushing data of json_data for i th entry into jsonDataObject as a whole
        jsonDataObject.push(json_data);
      }
      // Setting color for the coloumns of graph according to priority of items
      for (var j in jsonDataObject) {
        if (jsonDataObject[j].Priority == "HP") {
          //high priority:red
          var color = "#FF0000";
        } else if (jsonDataObject[j].Priority == "MP") {
          //medium priority:yellow
          var color = "#FFFF00";
        } else if (jsonDataObject[j].Priority == "LP") {
          //low priority : green
          var color = "#00FF00";
        }
        bar_color.push(color);
      }
      // Converting Json Object to JavaScript Array
      for (var j in jsonDataObject) {
        graph_arr.push([
          jsonDataObject[j].OderID,
          jsonDataObject[j].TimeTaken,
          bar_color[j],
          jsonDataObject[j].TimeTaken
        ]);
      }
      var graphArray_Final = google.visualization.arrayToDataTable(graph_arr);
      var data = new google.visualization.DataView(graphArray_Final);
      //setting up graph elements
      var options = {
        //horizontal axis
        hAxis: {
          title: "Order ID",
          titleTextStyle: {
            fontName: "Times-Roman",
            fontSize: 18,
            color: "white",
            bold: true,
            itallic: false
          },
          baselineColor: "white",
          textStyle: {
            color: "white",
            fontName: "Times-Roman",
            fontSize: 16
          }
        },
        //vertical axis
        vAxis: {
          title: "Time Taken (s)",
          titleTextStyle: {
            color: "white",
            fontName: "Times-Roman",
            fontSize: 18,
            bold: true,
            itallic: false
          },
          baselineColor: "white",
          textStyle: {
            color: "white",
            fontName: "Times-Roman",
            fontSize: 16
          },
          minValue: 0,
          viewWindow: {
            min: 0
          }
        },
        //legend
        legend: {
          position: "none"
        },
        //the popup
        annotations: {
          textStyle: {
            fontName: "Times-Roman",
            fontSize: 18,
            bold: true,
            // The color of the text.
            color: "#E7D1DA",
            // The color of the text outline.
            auraColor: "#171717",
            // The transparency of the text.
            opacity: 0.9
          }
        },
        //background color of graph area
        backgroundColor: {
          stroke: "lightslategray",
          fill: "#571616",
          strokeWidth: 4
        }
      };
      var chart = new google.visualization.ColumnChart(
        document.getElementById("column_chart")
      );
      chart.draw(data, options);
    }
  );
}

//********table*****************************
/////////////Ajax Requests////////////
$(document).ready(function () {
  // Fetch the initial table
  refreshTable();
  // Fetch every 1 second
  setInterval(refreshTable, 1000);
});

function refreshTable() {
  // var trHTML = '';
  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1q1ExDaPV-OBmVAfG2m07ZIo91fP4n2_LaOQ1L1wovAM/5/public/full?alt=json" +
      "&callback = ?",
    function (data) {
      var trHTML = "";
      for (var i = 0; i < data.feed.entry.length; ++i) {
        var myData_map, myData_order;
        //filling in table values for i th  item
        trHTML +=
          "<tr><td>" +
          data.feed.entry[i].gsx$orderid.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$item.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$priority.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$city.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$orderdispatched.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$ordershipped.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$ordertime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$dispatchtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$shippingtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$timetaken.$t +
          "</td></tr>";
      }
      console.log(trHTML);
      $("#tableContent").html(trHTML);
      var trHTML = "";
    }
  );
}
