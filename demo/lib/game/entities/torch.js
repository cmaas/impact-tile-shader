ig.module( 
	'game.entities.torch'
)
.requires(
	'impact.entity'
)
.defines(function() {
    
    EntityTorch = ig.Entity.extend({
        
        size: {x:8, y:8},
        animSheet: new ig.AnimationSheet('media/torch.png', 8, 8),
        lightOptions: {
            innerRadius: 0,
        	outerRadius: 3,
        },
        
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 0.15, [1,2,3,4,5,2,4,5]);
            this.currentAnim.gotoRandomFrame();
            this.initialPos = {x: this.pos.x, y: this.pos.y};
            //this.vel.y = -10;
        },
             
        update: function() {
            this.parent();
            if (this.pos.y < this.initialPos.y - 8*3) {
                this.vel.y = 10;            
            }
            if (this.pos.y > this.initialPos.y) {
                this.vel.y = -10;
            }
        },
                
        /*draw: function() {
            this.parent();
        },*/
        
    });
});