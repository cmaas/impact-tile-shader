ig.module(
    'game.TileShader'
)
    .defines(function () {
        TileShader = ig.Class.extend(
            {

                viewSize:{
                    x:0,
                    y:0
                },
                lightMap:null,
                losData:null,
                tileSize:0,
                innerRadius:0,
                outerRadius:10,
                fillCircle:true,
                innerShade:0,
                ambientLight:6,
                shadeCircle:true,
                losShade:true,
                shaderMap:null,
                lightImage:null,
                lastX:0,
                lastY:0,
                entities: [],
                lastEntityPositions: [],
                lastEntityX:0,
                lastEntityY:0,
                maxX:0,
                maxY:0,
                shaderTileSet:null,

                init:function (shaderMapName, shaderTileSet) {

                    this.shaderMap = ig.game.getMapByName("shader");
                    this.shaderTileSet = shaderTileSet;
                    this.tileSize = this.shaderMap.tilesize;

                    this.viewSize.x = this.shaderMap.width + 1;
                    this.viewSize.y = this.shaderMap.height + 1;

                    var data = new Array(this.viewSize.y);
                    var data2 = new Array(this.viewSize.y);
                    for (var iY = 0; iY < this.viewSize.y; iY++) {
                        data[iY] = new Array(this.viewSize.x);
                        data2[iY] = new Array(this.viewSize.x);
                        for (var iX = 0; iX < this.viewSize.x; iX++) {
                            data[iY][iX] = this.ambientLight;
                            data2[iY][iX] = 0;
                        }
                    }
                    this.losData = data2;

                    this.lightMap = new ig.BackgroundMap(this.tileSize, data, this.shaderTileSet);

                    this.lightImage = ig.$new('canvas');

                    this.lightImage.width = ig.system.width * ig.system.scale;
                    this.lightImage.height = ig.system.height * ig.system.scale;

                    this.maxX = this.shaderMap.width - 1;
                    this.maxY = this.shaderMap.height - 1;

                },
                addEntity: function (entity) {
                    this.entities.push(entity);
                    this.lastEntityPositions.push({x: this.entities.length*-1, y: this.entities.length*-1});
                },
                clear:function (lightValue) {
                    for (var iY = 0; iY < this.viewSize.y; iY++) {
                        for (var iX = 0; iX < this.viewSize.x; iX++) {
                            this.lightMap.data[iY][iX] = lightValue;
                            this.losData[iY][iX] = 0;
                        }
                    }
                },
                checkLos:function (fromLocalX, fromLocalY, toLocalX, toLocalY) {
                    var tilesX = ig.game.screen.x / (this.tileSize);
                    var tilesY = ig.game.screen.y / (this.tileSize);

                    var scrollTileX = tilesX + (tilesX < 0 ? -1 : 0) >> 0;
                    var scrollTileY = tilesY + (tilesY < 0 ? -1 : 0) >> 0;

                    var fromX = scrollTileX + fromLocalX;
                    var fromY = scrollTileY + fromLocalY;
                    var toX = scrollTileX + toLocalX;
                    var toY = scrollTileY + toLocalY;

                    var ddx = toX - fromX;
                    var ddy = toY - fromY;
                    var dx = ddx < 0 ? -ddx : ddx;
                    var dy = ddy < 0 ? -ddy : ddy;

                    var sx = (fromX < toX) ? 1 : -1;
                    var sy = (fromY < toY) ? 1 : -1;
                    var err = dx - dy;

                    var x = fromX;
                    var y = fromY;

                    var losBlocked = false;

                    while (true) {

                        if (!(y - scrollTileY < 1 || x - scrollTileX < 1) || y - scrollTileY > this.viewSize.y - 1 || x - scrollTileX > this.viewSize.x - 1) {

                            if (!losBlocked) {

                                if (this.checkBlockingTiles(x, y)) {

                                    losBlocked = true;
                                }
                            }
                            else {

                                if (!this.checkBlockingTiles(x, y)) {

                                    //this.setTile(y - scrollTileY, x - scrollTileX, this.ambientLight, true);
                                    this.setLosDarkTile(y - scrollTileY, x - scrollTileX);

                                }
                            }
                        }

                        if ((x == toX) && (y == toY)) break;
                        var e2 = 2 * err;
                        if (e2 > -dy) {
                            err -= dy;
                            x += sx;
                        }
                        if (e2 < dx) {
                            err += dx;
                            y += sy;
                        }
                    }

                },

                checkBlockingTiles:function (TileX, TileY) {

                    if (!(TileX < 0 || TileY < 0 || TileX > this.maxX || TileY > this.maxY )) {

                        return this.shaderMap.data[TileY][TileX] > 0;

                    }

                },

                calcShadeMap:function (centerX, centerY) {
                   
                    for (var i = this.outerRadius; i > this.innerRadius ; i--) {

                        var d = 3 - (2 * i);
                        var x = 0;
                        var y = i;
                        var shade = (i - this.innerRadius);
                        if (shade > this.ambientLight) shade = this.ambientLight;
                        if (shade < 0) shade = 0;

                        do {

                            if (this.fillCircle) {
                                for (var f = centerX - x; f < centerX + x + 1; f++) {
                                    this.setTile(centerY - y, f, shade);
                                    this.setTile(centerY + y, f, shade);

                                    if (this.losShade) {
                                        this.checkLos(centerX, centerY, f, centerY - y);
                                        this.checkLos(centerX, centerY, f, centerY + y);
                                    }

                                }

                                for (f = centerX - y; f < centerX + y + 1; f++) {
                                    this.setTile(centerY - x, f, shade);
                                    this.setTile(centerY + x, f, shade);

                                    if (this.losShade) {
                                        this.checkLos(centerX, centerY, f, centerY + x);
                                        this.checkLos(centerX, centerY, f, centerY - x);
                                    }

                                }
                            }
                            else {

                                this.setTile(centerY - y, centerX + x, shade);
                                this.setTile(centerY - y, centerX - x, shade);
                                this.setTile(centerY + y, centerX - x, shade);
                                this.setTile(centerY + y, centerX + x, shade);

                                this.setTile(centerY + x, centerX + y, shade);
                                this.setTile(centerY - x, centerX + y, shade);
                                this.setTile(centerY + x, centerX - y, shade);
                                this.setTile(centerY - x, centerX - y, shade);

                            }

                            if (d < 0) {
                                d = d + (4 * x) + 6;
                            } else {
                                d = d + 4 * (x - y) + 10;
                                y--;
                            }
                            x++;
                        }

                        while (x <= y);

                    }
                    
                    if (this.losShade) {
                        for (var iY = 0; iY < this.viewSize.y; iY++) {
                            for (var iX = 0; iX < this.viewSize.x; iX++) {
                                if (this.losData[iY][iX] > 0) {
                                    this.losData[iY][iX] = 2; // protect from others
                                }
                            }
                        }
                    }

                },
                        
                calcShadeMapBlocked: function() {
                    if (this.losShade) {
                        for (var iY = 0; iY < this.viewSize.y; iY++) {
                            for (var iX = 0; iX < this.viewSize.x; iX++) {
                                if (this.losData[iY][iX] === 0) {
                                    this.setTile(iY, iX, this.ambientLight, true);
                                }
                            }
                        }
                    }
                },

                setLosDarkTile: function(y, x) {
                    if (!(x < 0 || y < 0 || x > this.viewSize.x - 1 || y > this.viewSize.y - 1)) {
                        if (this.losData[y][x] < 2) {
                            this.losData[y][x] = 0;
                        }
                    }
                },

                setTile:function (y, x, shade, forceAmbient) {

                    if (shade > this.ambientLight) shade = this.ambientLight;
                    if (shade < 0) shade = 0;

                    if (!(x < 0 || y < 0 || x > this.viewSize.x - 1 || y > this.viewSize.y - 1)) {
                        if (!this.shadeCircle) {
                            this.lightMap.data[y][x] = this.innerShade;
                        }
                        else {
                            if (forceAmbient) {
                                this.lightMap.data[y][x] = shade;
                            }
                            else {
                                this.lightMap.data[y][x] = Math.min(shade, this.lightMap.data[y][x]);
                                if (this.losData[y][x] < 2) {
                                    this.losData[y][x] = 1; // I see this tile
                                }
                            }
                        }
                    }
                },

                draw: function( forceRedraw ) {
                    var offsetX = (this.shaderMap.scroll.x % this.shaderMap.tilesize);
                    var offsetY = (this.shaderMap.scroll.y % this.shaderMap.tilesize);
                    
                    offsetX = Math.abs(offsetX < 0 ? offsetX + (this.tileSize ) : offsetX + 0);
                    offsetY = Math.abs(offsetY < 0 ? offsetY + (this.tileSize ) : offsetY + 0);

                    // if redraw is forced, skip all other checks
                    if (forceRedraw) {
                        this.doDraw(true, offsetX, offsetY);
                        //this.drawold(this.entities[0].pos.x, this.entities[0].pos.y, 0, 1);
                        return;
                    }
                    
                    // check if map scrolled. if so, redraw everything
                    var checkOffsetX = Math.round(offsetX * 10) / 10;
                    var checkOffsetY = Math.round(offsetY * 10) / 10;
                    
                    if (checkOffsetX !== this.lastX || checkOffsetY !== this.lastY) {
                        this.lastX = checkOffsetX;
                        this.lastY = checkOffsetY;
                        this.doDraw(true, offsetX, offsetY);
                        return;
                    }
                    
                    // check if entities moved. if so, redraw everything
                    for (var i = 0; i < this.entities.length; i++) {
                        var epx = ig.system.getDrawPos((this.entities[i].pos.x - ig.game.screen.x)) / (this.tileSize * ig.system.scale);
                        var epy = ig.system.getDrawPos((this.entities[i].pos.y - ig.game.screen.y)) / (this.tileSize * ig.system.scale);
                        var entityX = epx + (epx < 0 ? -1 : 0) >> 0;
                        var entityY = epy + (epy < 0 ? -1 : 0) >> 0;
                        if (entityX !== this.lastEntityPositions[i].x || entityY !== this.lastEntityPositions[i].y ) {
                            this.doDraw(true, offsetX, offsetY);
                            return;
                        }
                    }
                    
                    // no forced redraw yet? just draw
                    this.doDraw(false);
                },

                doDraw: function( forceRedraw, offsetX, offsetY ) {
                    if (forceRedraw) {
                        this.clear(this.ambientLight);
                        for (var i = 0; i < this.entities.length; i++) {
                            var epx = ig.system.getDrawPos((this.entities[i].pos.x - ig.game.screen.x)) / (this.tileSize * ig.system.scale);
                            var epy = ig.system.getDrawPos((this.entities[i].pos.y - ig.game.screen.y)) / (this.tileSize * ig.system.scale);
                            var entityX = epx + (epx < 0 ? -1 : 0) >> 0;
                            var entityY = epy + (epy < 0 ? -1 : 0) >> 0;                            
                            this.calcShadeMap(entityX, entityY);
                            this.lastEntityPositions[i].x = entityX;
                            this.lastEntityPositions[i].y = entityY;
                        }
                        this.calcShadeMapBlocked();
                        var impactCtx = ig.system.context;
                        ig.system.context = this.lightImage.getContext('2d');
                        this.lightMap.setScreenPos(offsetX, offsetY);
                        ig.system.context.clearRect(0, 0, this.lightImage.width, this.lightImage.height);

                        this.lightMap.draw();

                        ig.system.context = impactCtx;
                    }
                    ig.system.context.drawImage(this.lightImage, 0, 0);
                },

                drawold: function (entityPosX, entityPosY, index, forceRedraw) {

                    var epx = ig.system.getDrawPos((entityPosX - ig.game.screen.x)) / (this.tileSize * ig.system.scale);
                    var epy = ig.system.getDrawPos((entityPosY - ig.game.screen.y)) / (this.tileSize * ig.system.scale);

                    var entityX = epx + (epx < 0 ? -1 : 0) >> 0;
                    var entityY = epy + (epy < 0 ? -1 : 0) >> 0;

                    var offsetX = (this.shaderMap.scroll.x % this.shaderMap.tilesize);
                    var offsetY = (this.shaderMap.scroll.y % this.shaderMap.tilesize);

                    offsetX = Math.abs(offsetX < 0 ? offsetX + (this.tileSize ) : offsetX + 0);
                    offsetY = Math.abs(offsetY < 0 ? offsetY + (this.tileSize ) : offsetY + 0);

                    var checkOffsetX = Math.round(offsetX * 10) / 10;
                    var checkOffsetY = Math.round(offsetY * 10) / 10;


                    if (forceRedraw || (!(checkOffsetX == this.lastX && checkOffsetY == this.lastY && entityX == this.lastEntityPositions[index].x && entityY == this.lastEntityPositions[index].y))) {

                        this.lastX = checkOffsetX;
                        this.lastY = checkOffsetY;
                        this.lastEntityPositions[index].x = entityX;
                        this.lastEntityPositions[index].y = entityY;

                        this.clear(this.ambientLight);

                        this.calcShadeMap(entityX, entityY);

                        var impactCtx = ig.system.context;
                        ig.system.context = this.lightImage.getContext('2d');
                        this.lightMap.setScreenPos(offsetX, offsetY);
                        ig.system.context.clearRect(0, 0, this.lightImage.width, this.lightImage.height);

                        this.lightMap.draw();

                        ig.system.context = impactCtx;
                    }

                    ig.system.context.drawImage(this.lightImage, 0, 0);

                }
            });
    });
