var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game', this, false, true);
var start = function(){};
start.prototype = {
    preload: function(){
        game.load.json('project', './project.json');
        
    },
    create: function(){
        game.assetSprites = [];
        game.json = game.cache.getJSON('project');
        game.capture = game.plugins.add(Phaser.Plugin.Capture);
        game.load.onLoadComplete.addOnce(start.prototype.actualStart);
        game.json.assets.forEach(function(asset){
            switch(asset.type){
                case "sprite":
                    game.assetSprites.push(asset);
                    var frames = 0;
                    var frameArr = [];
                    for(var frame in asset.frames){
                        var isIn = false;
                        frameArr.forEach(function(f){
                            asset.frames[frame].forEach(function(aF){
                                if(asset.frames[frame] === f){
                                    isIn = true;
                                }
                            });
                        });
                        asset.frames[frame].forEach(function(a){
                            frameArr.push(a);
                        });
                        if(isIn === false){
                            frames += asset.frames[frame].length;
                        }
                    }
                    game.load.spritesheet(asset.name, asset.src, asset.dims.x, asset.dims.y, frames);
                break;
                default: 
                    game.load.image(asset.name, asset.src);
                break;
            }
        });
        game.load.start();
    },
    actualStart: function(){
        game.keys = {};
        game.keys.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        game.keys.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        game.keys.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        game.keys.m = game.input.keyboard.addKey(Phaser.Keyboard.M);
        game.keys.c = game.input.keyboard.addKey(Phaser.Keyboard.C);
        game.keys.f = game.input.keyboard.addKey(Phaser.Keyboard.F);
        game.keys.z = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        game.keys.g = game.input.keyboard.addKey(Phaser.Keyboard.G);
        game.loaded = true;
        game.background = game.add.sprite(0, game.height/2, "Background");
        game.background.anchor.setTo(0, 0.5);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.floor = game.add.sprite(0, game.json.ground , "null");
        game.physics.arcade.enable(game.floor);
        game.floor.body.immovable = true;
        game.floor.body.allowGravity = false;
        game.floor.width = window.innerWidth;
        game.floor.height = 1;
        game.floor.alpha = 0;
        game.sprites = [];
        game.playerC = function(name, obj){
            this.p = game.add.sprite(0,game.json.ground - 50, name);
            this.p.anchor.setTo(0.5);
            this.p.scale.setTo(1.5);
            this.p.obj = obj;
            game.physics.arcade.enable(this.p);
            game.sprites.push(this.p);
            this.p.body.allowGravity = true;
            var self = this;
            for(var i in self.p.obj.frames){
                self.p.animations.add(i, self.p.obj.frames[i]);
            }
            game.currentRecord.name = name;
            return this.p;
        };
        game.recordObject = [];
        game.currentRecord = {arr: []};
        game.cIndex = 0;
        game.s = new game.playerC(game.assetSprites[game.cIndex].name, game.assetSprites[game.cIndex]);
        game.physics.arcade.gravity.y = 320;
        game.background.scale.setTo(1);
        /*{"x": 510, "y":360, "width": 35, "height": 35},
    	{"x": 632, "y": 360, "width": 170, "height": 35},
    	{"x": 703, "y": 232, "width": 35, "height": 35},
    	{"x": 890, "y": 425, "width": 71, "height": 65},
    	{"x": 1212, "y": 390, "width": 71, "height": 100}*/
        game.mapObjects = [];
        game.mapObjects.push(game.floor);
        for (var item in game.json.map){
            var mapI = game.json.map[item];
            var m = game.add.sprite(mapI.x, mapI.y , 'null');
            m.width = mapI.width;
            m.height = mapI.height;
            game.mapObjects.push(m);
            m.alpha = 0;
            game.physics.arcade.enable(m);
            m.body.immovable = true;
            m.body.allowGravity = false;
        }
        window.setInterval(function(){
            if(!game.isRecording){
                game.currentRecord.arr.push({x: game.s.x, y: game.s.y, direction: game.s.scale.x, frame:game.s.animations.currentFrame.index});
            }
        }, 5);
        game.cAnimation = [];
        game.imgArr = [];
        game.keys.f.onDown.add(function(){
            game.cAnimation.forEach(function(i){
                i.destroy();
            });
            if(game.isRecording){
                game.isRecording = false;
                game.s.alpha = 1;
                clearInterval(game.rInt);
                game.progressText = game.add.text(game.width/2, game.height/2, "Progress: 0%", {
                    font: "50px Times New Roman",
                    fill: "#ffffff"
                });
                game.progressText.anchor.setTo(0.5);
                gifshot.createGIF({'images': game.imgArr, 'numFrames': game.imgArr.length, 'sampleInterval': 20, 'gifWidth': window.innerWidth, 'gifHeight': window.innerHeight, 'progressCallback': function(currentProgress){
                    game.progressText.text = "Progress: " + Math.round(currentProgress * 10000)/100 + "%";
                }}, function(obj){
                    if(!obj.error){
                        document.getElementById("download").src = obj.image;
                        document.getElementById("game").innerHTML = "";
                    }
                });
            } else {
                game.imgArr = [];
                game.isRecording = true;
                var canv = document.getElementById("game").children[0];
                game.recordObject.forEach(function(r, i){
                    r.cIndex = 0;
                    r.record = r.arr;
                    r.s = game.add.sprite(r.record[0].x, r.record[0].y, r.name);
                    r.s.anchor.setTo(0.5);
                    r.s.scale.setTo(1.5);
                    game.cAnimation.push(r.s);
                });
                for(var j = 0; j < game.rB; j++){
                    game.recordObject.forEach(function(r, i){
                        if(r.cIndex < r.record.length){
                            r.s.position.setTo(r.record[r.cIndex].x, r.record[r.cIndex].y);
                            r.s.scale.x = r.record[r.cIndex].direction;
                            r.s.animations.frame = r.record[r.cIndex].frame;
                            r.cIndex += 1;
                        }
                    });
                    window.setTimeout(function(){
                        game.capture.screenshot(function(datURL){
                            game.imgArr.push(datURL);
                        });
                    }, 5);
                }
                game.isRecording = false;
                game.s.alpha = 0;
            }
        });
        game.keys.g.onDown.add(function(){
            game.s.destroy();
            game.cAnimation.forEach(function(i){
                i.destroy();
            });
            game.currentRecord = {arr: []};
            createAnim();
            game.s = new game.playerC(game.assetSprites[game.cIndex].name, game.assetSprites[game.cIndex]);
        });
        game.keys.c.onDown.add(function(){
            game.recordObject = [];
            game.avgArr = [];
            game.rArr = 0;
            game.s.destroy();
            game.cAnimation.forEach(function(i){
                i.destroy();
            });
            game.currentRecord = {arr: []};
            game.s = new game.playerC(game.assetSprites[game.cIndex].name, game.assetSprites[game.cIndex]);
        });
        game.avgArr = [];
        game.rB = 0;
        function createAnim(){
            if(!game.isRecording){
                var longest = 0;
                var lI = 0;
                game.recordObject.forEach(function(r, i){
                    if(r.arr.length > longest){
                        longest = r.arr.length;
                        lI = i;
                    }
                    var cIndex = 0;
                    var record = r.arr;
                    var start = new Date();
                    var s = game.add.sprite(record[0].x, record[0].y, r.name);
                    s.anchor.setTo(0.5);
                    s.scale.setTo(1.5);
                    game.physics.arcade.enable(s);
                    s.body.immovable = true;
                    s.body.allowGravity = false;
                    game.cAnimation.push(s);
                    var int = setInterval(function(){
                        s.position.setTo(record[cIndex].x, record[cIndex].y);
                        s.scale.x = record[cIndex].direction;
                        s.animations.frame = record[cIndex].frame;
                        cIndex += 1;
                        if(cIndex === record.length){
                            clearInterval(int);
                            if(lI === i){
                                game.avgArr.push(new Date() - start);
                                game.rB = record.length;
                            }
                        }
                    }, 5);
                });
            }
        }
        game.keys.m.onDown.add(function(){
            game.s.destroy();
            game.cAnimation.forEach(function(i){
                i.destroy();
            });
            game.cIndex += 1;
            if(game.cIndex > game.assetSprites.length - 1){
                game.cIndex = 0;
            }
            game.recordObject.push(game.currentRecord);
            game.currentRecord = {arr: []};
            createAnim();
            game.s = new game.playerC(game.assetSprites[game.cIndex].name, game.assetSprites[game.cIndex]);
        });
    },
    update: function(){
        if(game.loaded){
            game.mapObjects.forEach(function(m){
                game.physics.arcade.collide(game.s, m);
            });
            game.cAnimation.forEach(function(item){
                game.physics.arcade.collide(game.s, item);
            });
            
            game.physics.arcade.collide(game.s, game.floor);
            if(game.keys.z.isDown){
                game.s.animations.play("special");
            } else if(game.s.body.touching.down && !game.keys.right.isDown && !game.keys.left.isDown){
                game.s.animations.play('idle', 25);
            }
            if(game.s.body.touching.down){
                game.s.body.velocity.x *= 0.95;
            } else {
                game.s.body.velocity.x *= 0.96;
            }
            if(game.keys.space.isDown && (game.s.body.touching.down)){
                game.s.animations.play('jumpStart', 30, false);
                game.s.body.velocity.y = -320;
            }
            if(!game.s.body.touching.down){
                game.s.animations.play('jump', 30, true);
            }
            if(game.keys.right.isDown){
                game.s.body.velocity.x += 10;
                game.s.scale.setTo(1.5);
                if(game.s.body.touching.down){
                    game.s.animations.play('walk', 10, true);
                }
            }
            if(game.keys.left.isDown){
                game.s.body.velocity.x -= 10;
                game.s.scale.setTo(-1.5,1.5);
                if(game.s.body.touching.down){
                    game.s.animations.play('walk', 10, true);
                }
            }
        }
    }
};
game.state.add("start", start);
game.state.start("start");