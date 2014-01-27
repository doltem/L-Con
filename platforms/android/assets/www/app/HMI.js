//==================================VARIABLES====================================
var host="http://192.168.0.106";
//==================================MODELS===================================
//Model for Area Dropdown List
var areaModel = kendo.observable({
    area: "Tes",
    areaSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: host+"/service/area",
          dataType: "json",
          type: "GET"
        },
        create: {
          url: host+"/service/area",
          dataType: "json",
          type: "POST"
        },
        update:{
          url: host+"/service/area",
          dataType: "json",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("areaSource request START");
      },

      requestEnd: function (e){
        //console.log("areaSource request END");
      }

    }),

    deviceSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: host+"/service/location",
          dataType: "json",
          type: "GET"
        },
        update:{
          url: host+"/service/location",
          dataType: "json",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("deviceSource request START");
      },

      requestEnd: function (e){
        //console.log("deviceSource request END");
      }

    }),


    init: function(data){
      this.deviceSource.filter({ field: "area", operator: "eq", value: data });
      this.set("area",data);
    },

    onSelect: function(e){
      var index = e.item.index();
      var data = this.areaSource.view()[index];
      this.set("area",data.area);
      this.deviceSource.filter({ field: "area", operator: "eq", value: data.area });
      //console.log("masuk di onSelect")
      $("#modalview-area").data("kendoMobileModalView").close();
    }

});


//Model for Zone Dropdown List
var zoneModel = kendo.observable({
    id:"",
    address:"",
    alias:"",
    zone:"",
    occ: 1,
    lux:800,
    lamp:true,
    mode:false,
    setpoint: 900,
    errorband:50,
    index:0,
    
    onCommand:0,
    viewactive:0,

    zoneSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: host+"/service/zone",
          dataType: "JSON",
          type: "GET"
        },
        update:{
          url: host+"/service/zone",
          dataType: "JSON",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("zoneSource request START");
      },

      requestEnd: function (e){
        
      },


      filter: { field: "address", operator: "eq", value: "" }

    }),

    statusSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        read: {
          url: host+"/service/zone",
          dataType: "JSON",
          type: "GET"
        }
      },

      requestStart: function (e){
        console.log("statusSource request START");
      },

      requestEnd: function (e){
        setTimeout(function(){
          var data = zoneModel.statusSource.at(zoneModel.index);
          zoneModel.setStatusFilter(data);         
        }, 200);
        
        console.log("statusSource request END");
      },

    }),
    
    commandSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        create:{
          url: host+"/service/zone",
          dataType: "JSON",
          type: "POST"          
        }
      },

      requestStart: function (e){
        console.log("zommandSource request START");
      },

      requestEnd: function (e){
      },

    }),


    setZoneFilter: function(data){
      this.zoneSource.filter({ field: "address", operator: "eq", value: data });
    },

    setStatusFilter: function(data){
      this.set("zone",data.zone);
      this.set("occ",(data.occ==0)?"UNOCCUPIED":"OCCUPIED");
      this.set("lux",data.lux);
      this.set("lamp",(data.lamp==0)?false:true);
      this.set("mode",(data.mode==0)?false:true);
      this.set("setpoint",data.setpoint);
      this.set("errorband",data.errorband);
      this.set("address",data.address);
      this.set("alias",data.alias);
      this.set("id",data.id);
      //console.log("data [ occ, lux, lamp, mode, setpoint,errorband] : ["+this.occ+", "+this.lux+", "+this.lamp+", "+this.mode+", "+this.setpoint+", "+this.errorband+"]");
    },

    onSelect: function(e){
      var data = this.zoneSource.view()[e.item.index()];
      console.log(data);
      zoneModel.index=zoneModel.zoneSource.indexOf(data);
      //console.log("index "+zoneModel.index);
      this.setStatusFilter(data);
      $("#modalview-zone").data("kendoMobileModalView").close();
    },

    onChange: function(){
      zoneModel.onCommand=1;
      console.log("onChange")
      var command={
        zone: this.zone,
        address:this.address,
        lamp : (this.lamp==true)?1:0, 
        mode : (this.mode==true)?1:0, 
        setpoint : this.setpoint,
        errorband : this.errorband,
      };
      this.commandSource.add(command);
      console.log(this.commandSource.at(0));
      this.commandSource.sync();
      this.commandSource.remove(this.commandSource.at(0));
      setTimeout(function(){
        zoneModel.onCommand=0;
      }, 2000);
      
    },

    onEdit: function(data){
      var index = e.sender.select().index();
      
      this.trigger("zone:edit", { 
        name : this.zoneSource.view()[index],
        type : "zone"
      });
    }
  });

var eventModel = kendo.observable({

    eventSource: new kendo.data.DataSource({
      /*schema: {
        model: { id: "id"}
      }, ??????*/
      transport: {
        read: {
          url: host+"/service/event",
          dataType: "JSON",
          type: "GET"
        }        
      },

      requestStart: function (e){
        console.log("eventSource request START");
      },

      requestEnd: function (e){
        console.log("eventSource request END");
      }

    })
});

//=================================MODEL-BINDER===========================


//==================================CONTROLLER==============================
  //controller for statusview
  function setFilter(e){
    zoneModel.viewactive=1;
    zoneModel.setZoneFilter(e.view.params.address);
    //zoneModel.zoneSource.fetch(function(){
    zoneModel.zoneSource.fetch(function(){
      var data = zoneModel.zoneSource.view();
      zoneModel.index=zoneModel.zoneSource.indexOf(data[0]);
      zoneModel.setStatusFilter(data[0]);
    });
    //})
  }
  
  function statusViewActive(){
      zoneModel.viewactive=1;  
  }
  
///controller for device view
  function viewInit(){
    areaModel.areaSource.fetch(function(){
        var data = areaModel.areaSource.at(0);
        //console.log(data);
        areaModel.init(data.area);
    });
  }
  
  function deviceViewActive(){
      zoneModel.viewactive=0;  
  }

  function closeModalArea(){
    $("#modalview-area").kendoMobileModalView("close");
  }

  function closeModalZone(){
    $("#modalview-zone").kendoMobileModalView("close");
  }


(function pollStatus(){
   setTimeout(function(){
      console.log("onCommand"+zoneModel.onCommand);
      if(zoneModel.onCommand==0&&zoneModel.viewactive==1){
        zoneModel.statusSource.read(); 
     }
     pollStatus();
  }, 3000);
})();

(function pollArea(){
   setTimeout(function(){
      if(zoneModel.viewactive==0){
        areaModel.areaSource.read();  
        areaModel.deviceSource.read();
        zoneModel.zoneSource.read();
     }
      pollArea();
  }, 60000);
})();
