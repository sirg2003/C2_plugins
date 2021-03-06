﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TouchDirection2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_TouchDirection2.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
        this.touchwrap = null;
        this.behavior_index = null;
	};
    
	behtypeProto.TouchWrapGet = function ()
	{
        if (this.touchwrap != null)
            return;
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};   
    
    behtypeProto.OnTouchStart = function ()
    {
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
        var insts = this.objtype.instances;
        var i, cnt = insts.length;
        var inst;

        for (i=0; i<cnt; i++ )
        {
            inst = insts[i].behavior_insts[this.behavior_index];            
            inst.onMovingStart(this.GetABSX(), this.GetABSY());
        }
    };
    
    behtypeProto.OnTouchEnd = function ()
    {
    };

    // export     
	behtypeProto.GetABSX = function ()
	{
        return this.touchwrap.GetAbsoluteX();
	};  

	behtypeProto.GetABSY = function ()
	{
        return this.touchwrap.GetAbsoluteY();
	};     
        
	behtypeProto.GetLayerX = function(inst)
	{
        return this.touchwrap.GetX(inst.layer);
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return this.touchwrap.GetY(inst.layer);
	};  
    
	behtypeProto._is_release = function()
	{
        return (!this.touchwrap.IsInTouch());
	};    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
        type.TouchWrapGet();         
		this.pre_x = 0;
		this.pre_y = 0;           
        this.is_on_moving = false;
        this._dir = null;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = this.properties[0]; 
        this.move_axis = this.properties[1]; 
        this.move_proportion = this.properties[2];
	};

	behinstProto.tick = function ()
	{        
        if ( (this.activated == 0) ||
             (!this.is_on_moving)      )
        {
            return;        
        }
        
        // this.activated == 1 && this.is_on_moving        
        var inst = this.inst;
        var cur_x = this.type.GetABSX();
        var cur_y = this.type.GetABSY();
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;             
        if ( (dx!=0) || (dy!=0) )
        {
            switch (this.move_axis)
            {
                case 1:    // Horizontal
                    inst.x += (this.move_proportion * dx);
                    break;
                case 2:    // Vertical
                    inst.y += (this.move_proportion * dy);
                    break;
                case 3:    // Horizontal or vertical
                    if (this._dir == null)
                        this._dir = (Math.abs(dx) >= Math.abs(dy))? 0:1;
                    if (this._dir == 0)
                        inst.x += (this.move_proportion * dx);
                    else if (this._dir == 1)
                        inst.y += (this.move_proportion * dy);
                    break;
                default:   // Both
                    inst.x += (this.move_proportion * dx);
                    inst.y += (this.move_proportion * dy);
                    break;
            }
            inst.set_bbox_changed();
            this.pre_x = cur_x;
            this.pre_y = cur_y;                    
        }
        this.runtime.trigger(cr.behaviors.Rex_TouchDirection2.prototype.cnds.OnMoving, inst);
                                
        if ( this.type._is_release() )
        {
            this.is_on_moving = false;
            this._dir = null;
            this.runtime.trigger(cr.behaviors.Rex_TouchDirection2.prototype.cnds.OnMoveStop, inst); 
        }
	};  

	behinstProto.onMovingStart = function(x, y)
	{   
        this.is_on_moving = true;
        this.pre_x = x;
        this.pre_y = y;
        this.runtime.trigger(cr.behaviors.Rex_TouchDirection2.prototype.cnds.OnMoveStart, this.inst);
	};
        

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;    
    
	cnds.OnMoveStart = function ()
	{
        return true;
	};
    
	cnds.OnMoveStop = function ()
	{
		return true;
	}; 

 	cnds.OnMoving = function ()
	{   
        return true;
    }
    
 	cnds.IsMoving = function ()
	{   
        return (this.is_on_moving);
    }    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
        if ( (this.activated==0) && 
             this.is_on_moving &&
             (s==1)
           )
        {
            this.pre_x = this.type.GetABSX();
            this.pre_y = this.type.GetABSY();
        }
		this.activated = s;
	}; 

	acts.SetProportion = function (s)
	{
		this.move_proportion = s;
	}; 
    
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.X = function (ret)
	{
        ret.set_float( this.type.GetLayerX(this.inst) );
	};
	
	exps.Y = function (ret)
	{
	    ret.set_float( this.type.GetLayerY(this.inst) );
	};
	
	exps.AbsoluteX = function (ret)
	{
        ret.set_float( this.type.GetABSX(this.inst) );
	};
	
	exps.AbsoluteY = function (ret)
	{
        ret.set_float( this.type.GetABSY(this.inst) );
	};
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	}; 
    
	exps.Proportion = function (ret)
	{
		ret.set_float(this.move_proportion);
	}; 
    
}());