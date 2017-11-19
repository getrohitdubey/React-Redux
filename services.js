var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Place = require('../models/place');
var Pano = require('../models/pano');
var Properties = require('../models/properties');
var PanoNavigation = require('../models/panonavigation');
var PanoMarkersMaster = require('../models/panomarkermaster');
var PanoProperties = require('../models/panoproperties');

var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var inQuery = [];
router.post('/UpsertPlace', function (request, response) {
    console.log(request.body);      // your JSON
    var place = new Place(request.body);
    place.save(function (err, placeResponse) {
        if (err) {
            response.send(err);

            console.log(err);
        } else {
            response.send(placeResponse);
            console.log('meow');
        }
    });
    // echo the result back
});

router.post('/UpsertProperty', function (request, response) {
    console.log(request.body);      // your JSON
    var property = new Properties(request.body);
    property.save(function (err, propertyResponse) {
        if (err) {
            response.send(err);

            console.log(err);
        } else {
            response.send(propertyResponse);
            console.log('meow');
        }
    });
    // echo the result back
});

router.get('/GetPlacesByName', function (request, response) {
    console.log("request.body", request.body);      // your JSON

    var regex = new RegExp(request.query["term"], 'i');
    var query = Place.find({ Name: regex }).limit(20); //, { 'Name': 1 }
    query.select('_id Name MapCenter MapZoomLevel Type');

    query.exec(function (err, places) {
        if (!err) {
            console.log(places);
            // Method to construct the json result set
            //  var result = buildResultSet(users);
            response.send(places, {
                'Content-Type': 'application/json'
            }, 200);
        } else {
            console.log(err);
            response.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
    });
});


router.get('/GetPlacesForInitialLoad', function (request, response) {
    console.log(request.body);      // your JSON

    var query = Place.find({ Status: 1 }).limit(20); //, { 'Name': 1 }
    query.select('Name MapCenter MapZoomLevel');

    query.exec(function (err, places) {
        if (!err) {
            console.log(places);
            // Method to construct the json result set
            //  var result = buildResultSet(users);
            response.send(places, {
                'Content-Type': 'application/json'
            }, 200);
        } else {
            console.log(err);
            response.send(JSON.stringify(err), {
                'Content-Type': 'application/json'
            }, 404);
        }
    });
});

/*
                "events":{
                    "onSceneLoadProgress": "action-story-onSceneLoadProgress",
                    "onSceneLoadError": "action-story-onSceneLoadError",
                    "onSceneLoadStart": "action-story-onSceneLoadStart",
                    "onSceneLoadComplete": "action-story-onSceneLoadComplete"
                },
                */

router.get('/GetDefaultLocation', function (request, response) {
    console.log("request.query", request.query);
    var outerHandler = false, innerHandler = false;
    var result = {
        "hotSpotsDOM": {

        },
        "panoConfig": {
            "story": {
                "uid": "",
                "name": "",
                "slug": "",
                "description": "",
                "default": "",

                "scenes":
                [

                ]
            },
            "plugins": {
                "engines":
                [
                    {
                        "uid": "org.forgejs.vrviewer",
                        "url": "VRViewer/"
                    }
                ],

                "instances":
                [
                    {
                        "uid": "myplugin-instance-0",
                        "engine": "org.forgejs.vrviewer"
                    }
                ]
            },
            "actions":
            [
            ]

        }
    };
    var places;
    var query = Place.find({ Default: true });
    query.exec().then(function (placesDB) {
        places = placesDB;
        result.placeName = places[0].Name;
        result.panoConfig.story.uid = places[0]._id;
        result.panoConfig.story.name = places[0].Name;
        result.panoConfig.story.slug = places[0]._id;
        result.panoConfig.story.description = places[0].Name;
        var query = Pano.find({ PlaceId: new ObjectId(places[0]._id) });
        return query.exec();
    }).then(function (panos) {
        console.log("panos", panos);
        var inQuery = [];
        for (var i = 0; i < panos.length; i++) {
            var pano = panos[i];
            // console.log("default", pano.Default);

            if (pano.Default == true) {
                result.panoConfig.story.default = "scene-" + pano._id;
            }
            result.panoConfig.story.scenes[i] = {};
            result.panoConfig.story.scenes[i].uid = "scene-" + pano._id;
            result.panoConfig.story.scenes[i].name = pano.Name;
            //           result.panoConfig.story.scenes[i].slug = "scene-" + pano._id;
            result.panoConfig.story.scenes[i].slug = "";
            result.panoConfig.story.scenes[i].description = pano.Name;
            result.panoConfig.story.scenes[i].media = {};
            result.panoConfig.story.scenes[i].media.uid = "media-" + i;
            result.panoConfig.story.scenes[i].media.type = "image";
            result.panoConfig.story.scenes[i].media.source = {};
            result.panoConfig.story.scenes[i].media.source.format = "equi";
            result.panoConfig.story.scenes[i].media.source.url = pano.ImageUrl;
            //  console.log("pano._id", pano._id);
            inQuery[i] = new ObjectId(pano._id);
        }
        var query = PanoNavigation.find({ SourcePanoId: { $in: inQuery } }).populate('PanoMarkerId'); //, { 'Name': 1 } SourcePanoId:new ObjectId("5989967029bc7713698fd901") 
        return query.exec();

    }).then(function (panonavigations) {
        console.log("panonavigations", panonavigations);
        for (var j = 0; j < panonavigations.length; j++) {
            var panonavigation = panonavigations[j];
            //   console.log("panonavigation", panonavigation);

            if (panonavigation.PanoMarkerId.Type == 1) {
                for (var k = 0; k < result.panoConfig.story.scenes.length; k++) {
                    // console.log("result.panoConfig.story.scenes[k].uid", result.panoConfig.story.scenes[k].uid);
                    // console.log("panonavigations[j].SourcePanoId", panonavigation.SourcePanoId)
                    if (result.panoConfig.story.scenes[k].uid == "scene-" + panonavigation.SourcePanoId) {
                        //console.log("j", j);
                        var hotspotIndex = 0;
                        if (result.panoConfig.story.scenes[k].hotspots == null) {
                            result.panoConfig.story.scenes[k].hotspots = [];

                        } else {
                            hotspotIndex = result.panoConfig.story.scenes[k].hotspots.length;
                        }
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex] = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].uid = "hotspot-" + panonavigation._id;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].interactive = true;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].type = "dom";
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.id = "dom-" + panonavigation._id;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.width = "5em";
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.height = "5em";
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.color = "transparent";
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.index = 5;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].dom.class = ["content-style__above", "media-style__see-through", "hover-trig"]
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].transform = {
                            /*  "position": {
                                  "theta": 82,
                                  "phi": -2,
                                  "radius": 1000
                              }*/
                        };
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].transform = panonavigation.PanoMarkerPosition;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].events = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].events.onClick = ["action-" + panonavigation._id];
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].propertyCount = 0;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].destinationPanoId = panonavigation.DestinationPanoId;

                        //  console.log("result.panoConfig.story.scenes[k].hotspots[j]", result.panoConfig.story.scenes[k].hotspots[j]);
                        var actionIndex = 0;
                        if (result.panoConfig.actions.length > 0) {
                            actionIndex = result.panoConfig.actions.length;
                        }
                        result.panoConfig.actions[actionIndex] = {};
                        result.panoConfig.actions[actionIndex].uid = "action-" + panonavigation._id;
                        result.panoConfig.actions[actionIndex].target = "viewer.customerAction";
                        result.panoConfig.actions[actionIndex].method = {};
                        result.panoConfig.actions[actionIndex].method.name = "openPropTour"
                        result.panoConfig.actions[actionIndex].method.args = [];
                        result.panoConfig.actions[actionIndex].method.args[0] = {};
                        result.panoConfig.actions[actionIndex].method.args[0].theta = panonavigation.PanoMarkerPosition.position.theta;
                        result.panoConfig.actions[actionIndex].method.args[0].phi = panonavigation.PanoMarkerPosition.position.phi;
                        result.panoConfig.actions[actionIndex].method.args[0].scene = "scene-" + panonavigation.DestinationPanoId;
                        break;
                    }
                }
                var length = 0;
                if (inQuery.length == 0) {
                    length = 0
                } else {
                    length = inQuery.length;
                }
                inQuery[length] = new ObjectId(panonavigation.DestinationPanoId);

            } else if (panonavigation.PanoMarkerId.Type == 2) {
                for (var k = 0; k < result.panoConfig.story.scenes.length; k++) {
                    // console("type2 result.panoConfig.story.scenes[k].uid", result.panoConfig.story.scenes[k].uid);
                    // console("type2 panonavigation.SourcePanoId", "scene-" + panonavigation.SourcePanoId);
                    if (result.panoConfig.story.scenes[k].uid == "scene-" + panonavigation.SourcePanoId) {
                        var hotspotIndex = 0;
                        if (result.panoConfig.story.scenes[k].hotspots == null) {
                            result.panoConfig.story.scenes[k].hotspots = [];

                        } else {
                            hotspotIndex = result.panoConfig.story.scenes[k].hotspots.length;
                        }
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex] = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].uid = "hotspot-" + panonavigation._id;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].transform = {

                        };
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].transform = panonavigation.PanoMarkerPosition;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].geometry = {
                            "type": "plane",
                            "options": {
                                "width": 100,
                                "height": 100
                            }
                        };
                        //   result.panoConfig.story.scenes[k].hotspots[hotspotIndex].geometry = panonavigation.PanoMarkerId.Geometry;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].material = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].material.image = panonavigation.PanoMarkerId.URL;
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].material.opacity = 1;

                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].events = {};
                        result.panoConfig.story.scenes[k].hotspots[hotspotIndex].events.onClick = ["action-" + panonavigation._id];

                        var actionIndex = 0;
                        if (result.panoConfig.actions.length > 0) {
                            actionIndex = result.panoConfig.actions.length;
                        }
                        result.panoConfig.actions[actionIndex] = {};
                        result.panoConfig.actions[actionIndex].uid = "action-" + panonavigation._id;
                        result.panoConfig.actions[actionIndex].target = "viewer.customerAction";
                        result.panoConfig.actions[actionIndex].method = {};
                        result.panoConfig.actions[actionIndex].method.name = "openPropTour"
                        result.panoConfig.actions[actionIndex].method.args = [];
                        result.panoConfig.actions[actionIndex].method.args[0] = {};
                        result.panoConfig.actions[actionIndex].method.args[0].theta = panonavigation.PanoMarkerPosition.position.theta;
                        result.panoConfig.actions[actionIndex].method.args[0].phi = panonavigation.PanoMarkerPosition.position.phi;
                        result.panoConfig.actions[actionIndex].method.args[0].scene = "scene-" + panonavigation.DestinationPanoId;
                        break;
                    }

                }

            }

            //   if (panoDefault == true) {



            // } else {

            //}
        }
        if (inQuery.length > 0) {
            //    console.log("PanoProperties inQuery.length ", inQuery)
            var query = PanoProperties.find({ PanoId: { $in: inQuery } }).populate('PropertyId').populate('PanoMarkerId'); //, { 'Name': 1 } SourcePanoId:new ObjectId("5989967029bc7713698fd901") 
            return query.exec();
        } else {
            response.send(result, {
                'Content-Type': 'application/json'
            }, 200);
        }

    }).then(function (panoProperties) {
        console.log("panoProperties", panoProperties);
        var panoPropertiesLength = panoProperties.length;

        var scenesLength = result.panoConfig.story.scenes.length;

        for (var i = 0; i < scenesLength; i++) {
            var scene = result.panoConfig.story.scenes[i];
            for (var j = 0; j < panoPropertiesLength; j++) {
                var panoProperty = panoProperties[j];

                if (scene.uid == "scene-" + panoProperty.PanoId) {
                    var hotspotIndex = 0;
                    if (scene.hotspots == null) {
                        scene.hotspots = [];

                    } else {
                        hotspotIndex = scene.hotspots.length;
                    }
                    scene.hotspots[hotspotIndex] = {};
                    scene.hotspots[hotspotIndex].uid = "hotspot-" + panoProperty._id;
                    scene.hotspots[hotspotIndex].transform = {

                    };
                    scene.hotspots[hotspotIndex].transform = panoProperty.PanoMarkerPosition;
                    scene.hotspots[hotspotIndex].geometry = {
                        "type": "plane",
                        "options": {
                            "width": 50,
                            "height": 50
                        }
                    };
                    //   result.panoConfig.story.scenes[k].hotspots[hotspotIndex].geometry = panonavigation.PanoMarkerId.Geometry;
                    scene.hotspots[hotspotIndex].material = {};
                    scene.hotspots[hotspotIndex].material.image = panoProperty.PanoMarkerId.URL;
                    scene.hotspots[hotspotIndex].material.opacity = 1;

                    scene.hotspots[hotspotIndex].events = {};
                    scene.hotspots[hotspotIndex].events.onClick = ["action-" + panoProperty._id];

                    var actionIndex = 0;
                    if (result.panoConfig.actions.length > 0) {
                        actionIndex = result.panoConfig.actions.length;
                    }
                    result.panoConfig.actions[actionIndex] = {};
                    result.panoConfig.actions[actionIndex].uid = "action-" + panoProperty._id;
                    result.panoConfig.actions[actionIndex].target = "viewer.customerAction";
                    result.panoConfig.actions[actionIndex].method = {};
                    result.panoConfig.actions[actionIndex].method.name = "openPropDetails"
                    result.panoConfig.actions[actionIndex].method.args = [];
                    result.panoConfig.actions[actionIndex].method.args[0] = panoProperty.PropertyId;
                    result.panoConfig.actions[actionIndex].type= panoProperty.PanoMarkerId.Type;
                }
            }
        }


        if (inQuery.length > 0) {
            const aggregatorOpts = [
                {
                    $match: {
                        PanoId: { $in: inQuery }
                    }
                },
                {
                    $group: {
                        _id: "$PanoId",
                        count: { $sum: 1 }
                    }
                }
            ]
            console.log("PanoProperties inQuery.length ", inQuery)
            var query = PanoProperties.aggregate(aggregatorOpts) //, { 'Name': 1 } SourcePanoId:new ObjectId("5989967029bc7713698fd901") 
            return query.exec();
        } else {
            response.send(result, {
                'Content-Type': 'application/json'
            }, 200);
        }

    }).then(function (propertiesGroup) {
        console.log("propertiesGroup", propertiesGroup);

        var scenesLength = result.panoConfig.story.scenes.length;
        for (var i = 0; i < scenesLength; i++) {
            if (result.panoConfig.story.scenes[i].uid == result.panoConfig.story.default) {
                var scene = result.panoConfig.story.scenes[i]
                var hotspotsLength = scene.hotspots.length;
                for (var j = 0; j < hotspotsLength; j++) {
                    var hotspot = scene.hotspots[j];
                    var propertiesGroupLength = propertiesGroup.length;
                    for (var k = 0; k < propertiesGroupLength; k++) {
                        var pg = propertiesGroup[k];
                        console.log("pg", pg);
                        console.log("hotspot", hotspot);

                        if (pg._id.equals(hotspot.destinationPanoId)) {
                            hotspot.propertyCount = pg.count;
                            console.log("pg.count", pg.count);
                            break;
                        }
                    }

                }
                break;
            }
        }

        response.send(result, {
            'Content-Type': 'application/json'
        }, 200);
    }).then(null, function (err) {
        console.log("err", err);
        response.send(JSON.stringify(err), {
            'Content-Type': 'application/json'
        }, 404);
    });;



    /*  var query = Place.find({ Default: true }); //, { 'Name': 1 }
      //  query.select('Name MapCenter MapZoomLevel');
  
      query.exec(function (err, places) {
          if (!err) {
              // console.log(places);
              if (places.length > 0) {
                  result.placeName = places[0].Name;
                  result.panoConfig.story.uid = places[0]._id;
                  result.panoConfig.story.name = places[0].Name;
                  result.panoConfig.story.slug = places[0]._id;
                  result.panoConfig.story.description = places[0].Name;
  
                  // console.log("test ", places[0]._id);
                  var query = Pano.find({ PlaceId: new ObjectId(places[0]._id) }); //, { 'Name': 1 }
                  query.exec(function (err, panos) {
                      if (!err) {
                          //  console.log(panos);
                          for (var i = 0; i < panos.length; i++) {
                              var pano = panos[i];
                              // console.log("default", pano.Default);
  
                              if (pano.Default == true) {
                                  result.panoConfig.story.default = pano._id;
                              }
                              result.panoConfig.story.scenes[i] = {};
                              result.panoConfig.story.scenes[i].uid = pano._id;
                              result.panoConfig.story.scenes[i].name = pano.Name;
                              result.panoConfig.story.scenes[i].slug = pano._id;
                              result.panoConfig.story.scenes[i].description = pano.Name;
                              result.panoConfig.story.scenes[i].media = {};
                              result.panoConfig.story.scenes[i].media.uid = "media-" + i;
                              result.panoConfig.story.scenes[i].media.type = "image";
                              result.panoConfig.story.scenes[i].media.source = {};
                              result.panoConfig.story.scenes[i].media.source.format = "equi";
                              result.panoConfig.story.scenes[i].media.source.url = pano.ImageUrl;
                              console.log("pano._id", pano._id);
  
                              var query = PanoNavigation.find({ SourcePanoId: new ObjectId(pano._id) }).populate('PanoMarkerId'); //, { 'Name': 1 } SourcePanoId:new ObjectId("5989967029bc7713698fd901") 
                              query.exec(function (err, panonavigations) {
                                  if (!err) {
  
                                      for (var j = 0; j < panonavigations.length; j++) {
                                          var panonavigation = panonavigations[j];
                                          //   console.log("panonavigation", panonavigation);
  
                                          if (panonavigation.PanoMarkerId.Type == 1) {
                                              for (var k = 0; k < result.panoConfig.story.scenes.length; k++) {
                                                  // console.log("result.panoConfig.story.scenes[k].uid", result.panoConfig.story.scenes[k].uid);
                                                  // console.log("panonavigations[j].SourcePanoId", panonavigation.SourcePanoId)
                                                  if (result.panoConfig.story.scenes[k].uid.equals(panonavigation.SourcePanoId)) {
                                                      //console.log("j", j);
                                                      result.panoConfig.story.scenes[k].hotspots = [];
                                                      result.panoConfig.story.scenes[k].hotspots[j] = {};
                                                      result.panoConfig.story.scenes[k].hotspots[j].uid = panonavigation._id;
                                                      result.panoConfig.story.scenes[k].hotspots[j].propertyCount = 2;
                                                      result.panoConfig.story.scenes[k].hotspots[j].interactive = true;
                                                      result.panoConfig.story.scenes[k].hotspots[j].type = "dom";
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom = {};
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.id = "hotspot-" + panonavigation._id;
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.width = "5em";
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.height = "5em";
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.color = "transparent";
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.index = 5;
                                                      result.panoConfig.story.scenes[k].hotspots[j].dom.class = ["content-style__above", "media-style__see-through", "hover-trig"]
                                                      result.panoConfig.story.scenes[k].hotspots[j].transform = {};
                                                      result.panoConfig.story.scenes[k].hotspots[j].transform = panonavigation.PanoMarkerPosition;
                                                      result.panoConfig.story.scenes[k].hotspots[j].events = {};
                                                      result.panoConfig.story.scenes[k].hotspots[j].events.onClick = "action-" + panonavigation._id;
                                                      //  console.log("result.panoConfig.story.scenes[k].hotspots[j]", result.panoConfig.story.scenes[k].hotspots[j]);
                                                      break;
                                                  }
                                              }
                                          }
  
                                          //   if (panoDefault == true) {
  
       
  
                                          // } else {
  
                                          //}
                                      }
                                      console.log("panonavigations[0].SourcePanoId", panonavigations[0].SourcePanoId);
                                      console.log("panos[panos.length - 1]._id", panos[panos.length - 1]._id);
                                      if (panonavigations[0].SourcePanoId.equals(panos[panos.length - 1]._id)) {
                                          //    console.log("result", result);
                                          response.send(result, {
                                              'Content-Type': 'application/json'
                                          }, 200);
                                      }
                                  } else {
                                      console.log(err);
                                      response.send(JSON.stringify(err), {
                                          'Content-Type': 'application/json'
                                      }, 404);
                                  }
                              });
                          }
                          outerHandler = true;
                          //  returnResponse(response, result, outerHandler, innerHandler);
                      } else {
                          console.log(err);
                          response.send(JSON.stringify(err), {
                              'Content-Type': 'application/json'
                          }, 404);
                      }
                  });
  
              }
  
          } else {
              console.log(err);
              response.send(JSON.stringify(err), {
                  'Content-Type': 'application/json'
              }, 404);
          }
      });*/

});

function returnResponse(response, result) {



}

router.get('/SearchProperty', function (request, response) {
    console.log("request.query", request.query);      // your JSON

    var neighborhoods = {
        "Neighborhoods": [
            {
                "Name": "El Centro",
                "Type": 4,
                "MapZoomLevel": 15,
                "MapCenter": {
                    "type": "Point",
                    "coordinates": [
                        -105.2390468,
                        20.6103708
                    ]
                },
                "NeighborhoodCenter": {
                    "type": "Point",
                    "coordinates": [
                        -105.2339264,
                        20.6105165
                    ]
                },
                "PanoGroups": [
                    {
                        "MapPosition": {
                            "type": "Point",
                            "coordinates": [
                                -105.2342348,
                                20.611556
                            ]
                        },
                        "MapZoomLevel": 15,
                        "MapMarkerSize": 5,
                        "Panos": [
                            {
                                "_id": "598c343cbb69660da9a591b1",
                                "Name": "ScanCasa1",
                                "PanoType": "equi",
                                "PanoImageUrl": "/img/scan-casa-interactive-media.jpg",
                                "MapPosition": {
                                    "type": "Point",
                                    "coordinates": [
                                        -105.2342348,
                                        20.611556
                                    ]
                                },
                                "PanoMarkers": [
                                    {
                                        "PropertyId": "598c343cbb69660da9a591f3",
                                        "PanoMarkerPosition": {
                                            "Theta": -25,
                                            "Radius": 400,
                                            "Phi": -1.5
                                        }
                                    },
                                    {
                                        "PropertyId": "598c343cbb69660da9a591f4",
                                        "PanoMarkerPosition": {
                                            "Theta": 10,
                                            "Radius": 400,
                                            "Phi": -5
                                        }
                                    }
                                ]
                            }
                        ],
                        "Properties": [
                            {
                                "_id": "598c343cbb69660da9a591f3",
                                "Address": "Paraguay 1117, 5 de Diciembre, 48300",
                                "PlaceId": "59898bda7524ab110e62ef36",
                                "MapLocation": {
                                    "type": "Point",
                                    "coordinates": [
                                        -105.2342348,
                                        20.611556
                                    ]
                                },
                                "VRUrl": "https://my.matterport.com/show/?m=hyBUCKCNw17&play=1&qs=1",
                                "UserName": "anup",
                                "Type": 1,
                                "Sleeps": 5,
                                "Bedrooms": 2,
                                "Bathrooms": 2,
                                "HalfBaths": 1,
                                "MinimumStay": 3,
                                "Area": 4400,
                                "Status": 1
                            },
                            {
                                "_id": "598c343cbb69660da9a591f4",
                                "Address": "Paraguay 1117, 5 de Diciembre, 48300",
                                "PlaceId": "59898bda7524ab110e62ef36",
                                "MapLocation": {
                                    "type": "Point",
                                    "coordinates": [
                                        -105.2342348,
                                        20.611556
                                    ]
                                },
                                "VRUrl": "https://my.matterport.com/show/?m=hyBUCKCNw17&play=1&qs=1",
                                "UserName": "anup",
                                "Type": 1,
                                "Sleeps": 5,
                                "Bedrooms": 2,
                                "Bathrooms": 2,
                                "HalfBaths": 1,
                                "MinimumStay": 3,
                                "Area": 4400,
                                "Status": 1
                            }
                        ],
                        "PanoNavigation": [
                            /*{
                                "SourcePanoId":"598c343cbb69660da9a591b1",
                                "PanoMarkerPosition":{
                                        "type": "Point",
                                        "coordinates": [
                                            -105.2342348,
                                            20.611556
                                        ]
                                    },
                                "DestinationPanoId":"598c343cbb69660da9a591b2"
                            }*/
                        ]
                    },
                    {
                        "MapPosition": {
                            "type": "Point",
                            "coordinates": [
                                -105.2370001,
                                20.6071169
                            ]
                        },
                        "MapZoomLevel": 15,
                        "MapMarkerSize": 5,
                        "Panos": [
                            {
                                "_id": "598c343cbb69660da9a591b1",
                                "Name": "ScanCasa1",
                                "PanoType": "equi",
                                "PanoImageUrl": "/img/scan-casa-interactive-media.jpg",
                                "MapPosition": {
                                    "type": "Point",
                                    "coordinates": [
                                        -105.2342348,
                                        20.611556
                                    ]
                                },
                                "PanoMarkers": [
                                    {
                                        "PropertyId": "598c343cbb69660da9a591f3",
                                        "PanoMarkerPosition": {
                                            "Theta": -25,
                                            "Radius": 400,
                                            "Phi": -1.5
                                        }
                                    }
                                ]
                            }
                        ],
                        "Properties": [
                            {
                                "_id": "598c343cbb69660da9a591f3",
                                "Address": "Paraguay 1117, 5 de Diciembre, 48300",
                                "PlaceId": "59898bda7524ab110e62ef36",
                                "MapLocation": {
                                    "type": "Point",
                                    "coordinates": [
                                        -105.2342348,
                                        20.611556
                                    ]
                                },
                                "VRUrl": "https://my.matterport.com/show/?m=hyBUCKCNw17&play=1&qs=1",
                                "UserName": "anup",
                                "Type": 1,
                                "Sleeps": 5,
                                "Bedrooms": 2,
                                "Bathrooms": 2,
                                "HalfBaths": 1,
                                "MinimumStay": 3,
                                "Area": 4400,
                                "Status": 1
                            }
                        ],
                        "PanoNavigation": [
                            /*{
                                "SourcePanoId":"598c343cbb69660da9a591b1",
                                "PanoMarkerPosition":{
                                        "type": "Point",
                                        "coordinates": [
                                            -105.2342348,
                                            20.611556
                                        ]
                                    },
                                "DestinationPanoId":"598c343cbb69660da9a591b2"
                            }*/
                        ]
                    }
                ]
            }
        ]
    };

    var cities = {
        "Cities": [
            {
                "Name": "Puerto Vallarta",
                "Type": 3,
                "MapZoomLevel": 13,
                "MapCenter": {
                    "type": "Point",
                    "coordinates": [
                        -105.2596296,
                        20.6409485
                    ]
                }

            }

        ]
    };
    var res = {};
    var locationType = request.query.LocationType;
    if (locationType == 3)      // your JSON
    {
        res.Cities = cities.Cities;
        res.Cities[0].Neighborhoods = neighborhoods.Neighborhoods;

    } else if (locationType == 4)      // your JSON
    {
        res.Neighborhoods = neighborhoods.Neighborhoods;
    }
    response.send(res, {
        'Content-Type': 'application/json'
    }, 200);

});



module.exports = router;