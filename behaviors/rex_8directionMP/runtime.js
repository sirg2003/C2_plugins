﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_EightDirMP = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_EightDirMP.prototype;
		
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
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		
		// Key states
		this.upkey = false;
		this.downkey = false;
		this.leftkey = false;
		this.rightkey = false;
		this.ignoreInput = false;
		
		// Simulated key states
		this.simup = false;
		this.simdown = false;
		this.simleft = false;
		this.simright = false;
		
		// attempted workaround for sticky keys bug
		this.lastuptick = -1;
		this.lastdowntick = -1;
		this.lastlefttick = -1;
		this.lastrighttick = -1;
		
		// Movement
		this.dx = 0;
		this.dy = 0;
		
		this.enabled = true;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.maxspeed = this.properties[0];
		this.acc = this.properties[1];
		this.dec = this.properties[2];
		this.directions = this.properties[3];	// 0=Up & down, 1=Left & right, 2=4 directions, 3=8 directions"
		this.angleMode = this.properties[4];	// 0=No,1=90-degree intervals, 2=45-degree intervals, 3=360 degree (smooth)
		this.defaultControls = (this.properties[5] === 1);	// 0=no, 1=yes
		
		// Only bind keyboard events via jQuery if default controls are in use
		if (this.defaultControls)
		{
			jQuery(document).keydown(
				(function (self) {
					return function(info) {
						self.onKeyDown(info);
					};
				})(this)
			);
			
			jQuery(document).keyup(
				(function (self) {
					return function(info) {
						self.onKeyUp(info);
					};
				})(this)
			);
		}
        
        // control key code
        this.KEY_LEFT = 37;
        this.KEY_UP = 38;    
        this.KEY_RIGHT = 39;
        this.KEY_DOWN = 40;  
        this.KEY_EXTRA = {};
        this.current_extra_ctlName = null;
        this.is_echo = false;
	};

	behinstProto.onKeyDown = function (info)
	{	
	    var keycode = info.which;
		var tickcount = this.runtime.tickcount;
		
		switch (keycode) {
		case this.KEY_LEFT:	// left
			info.preventDefault();
			
			// Workaround for sticky keys bug: reject if arriving on same tick as onKeyUp event
			if (this.lastlefttick < tickcount)
				this.leftkey = true;
			
			break;
		case this.KEY_UP:	// up
			info.preventDefault();
			
			if (this.lastuptick < tickcount)
				this.upkey = true;
				
			break;
		case this.KEY_RIGHT:	// right
			info.preventDefault();
			
			if (this.lastrighttick < tickcount)
				this.rightkey = true;
				
			break;
		case this.KEY_DOWN:	// down
			info.preventDefault();
			
			if (this.lastdowntick < tickcount)
				this.downkey = true;
			
			break;
		}
        
        var extra_ctl = this.KEY_EXTRA[keycode];
        if (extra_ctl && !extra_ctl.state)
        {
            extra_ctl.state = true;
            this.current_extra_ctlName = extra_ctl.name;
            this.is_echo = false;
            this.runtime.trigger(cr.behaviors.Rex_EightDirMP.prototype.cnds.OnExtraCtlPressed, this.inst);
            if (this.is_echo)
                info.preventDefault();
            this.current_extra_ctlName = null;
        }
	};

	behinstProto.onKeyUp = function (info)
	{
	    var keycode = info.which;
		var tickcount = this.runtime.tickcount;
		
		switch (keycode) {
		case this.KEY_LEFT:	// left
			info.preventDefault();
			this.leftkey = false;
			this.lastlefttick = tickcount;
			break;
		case this.KEY_UP:	// up
			info.preventDefault();
			this.upkey = false;
			this.lastuptick = tickcount;
			break;
		case this.KEY_RIGHT:	// right
			info.preventDefault();
			this.rightkey = false;
			this.lastrighttick = tickcount;
			break;
		case this.KEY_DOWN:	// down
			info.preventDefault();
			this.downkey = false;
			this.lastdowntick = tickcount;
			break;
		}       
        
        var extra_ctl = this.KEY_EXTRA[keycode];
        if (extra_ctl)
        {            
            extra_ctl.state = false;
            this.current_extra_ctlName = extra_ctl.name;
            this.is_echo = false;
            this.runtime.trigger(cr.behaviors.Rex_EightDirMP.prototype.cnds.OnExtraCtlReleased, this.inst);
            if (this.is_echo)
                info.preventDefault();
        }        
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var up = this.upkey || this.simup;
		var down = this.downkey || this.simdown;
		this.simleft = false;
		this.simright = false;
		this.simup = false;
		this.simdown = false;
		
		if (!this.enabled)
			return;
		
		// Is already overlapping solid: must have moved itself in (e.g. by rotating or being crushed),
		// so push out
		var collobj = this.runtime.testOverlapSolid(this.inst);
		if (collobj)
		{
			this.runtime.registerCollision(this.inst, collobj);
			if (!this.runtime.pushOutSolidNearest(this.inst))
				return;		// must be stuck in solid
		}
		
		// Ignoring input: ignore all keys
		if (this.ignoreInput)
		{
			left = false;
			right = false;
			up = false;
			down = false;
		}
		
		// Up & down mode: ignore left & right keys
		if (this.directions === 0)
		{
			left = false;
			right = false;
		}
		// Left & right mode: ignore up & down keys
		else if (this.directions === 1)
		{
			up = false;
			down = false;
		}
		
		// 4 directions mode: up/down take priority over left/right
		if (this.directions === 2 && (up || down))
		{
			left = false;
			right = false;
		}
		
		// Apply deceleration when no arrow key pressed, for each axis
		if (left == right)	// both up or both down
		{
			if (this.dx < 0)
			{
				this.dx += this.dec * dt;
				
				if (this.dx > 0)
					this.dx = 0;
			}
			else if (this.dx > 0)
			{
				this.dx -= this.dec * dt;
				
				if (this.dx < 0)
					this.dx = 0;
			}
		}
		
		if (up == down)
		{
			if (this.dy < 0)
			{
				this.dy += this.dec * dt;
				
				if (this.dy > 0)
					this.dy = 0;
			}
			else if (this.dy > 0)
			{
				this.dy -= this.dec * dt;
				
				if (this.dy < 0)
					this.dy = 0;
			}
		}
		
		// Apply acceleration
		if (left && !right)
		{
			// Moving in opposite direction to current motion: add deceleration
			if (this.dx > 0)
				this.dx -= (this.acc + this.dec) * dt;
			else
				this.dx -= this.acc * dt;
		}
		
		if (right && !left)
		{
			if (this.dx < 0)
				this.dx += (this.acc + this.dec) * dt;
			else
				this.dx += this.acc * dt;
		}
		
		if (up && !down)
		{
			if (this.dy > 0)
				this.dy -= (this.acc + this.dec) * dt;
			else
				this.dy -= this.acc * dt;
		}
		
		if (down && !up)
		{
			if (this.dy < 0)
				this.dy += (this.acc + this.dec) * dt;
			else
				this.dy += this.acc * dt;
		}
		
		var ax, ay;
		
		if (this.dx !== 0 || this.dy !== 0)
		{
			// Limit to max speed
			var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
			
			if (speed > this.maxspeed)
			{
				// Limit vector magnitude to maxspeed
				var a = Math.atan2(this.dy, this.dx);
				this.dx = this.maxspeed * Math.cos(a);
				this.dy = this.maxspeed * Math.sin(a);
			}
			
			// Save old position and angle
			var oldx = this.inst.x;
			var oldy = this.inst.y;
			var oldangle = this.inst.angle;
			
			// Attempt X movement
			this.inst.x += this.dx * dt;
			this.inst.set_bbox_changed();
			
			collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj)
			{
				this.inst.x = oldx;
				this.dx = 0;
				this.inst.set_bbox_changed();
				this.runtime.registerCollision(this.inst, collobj);
			}
			
			this.inst.y += this.dy * dt;
			this.inst.set_bbox_changed();
			
			collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj)
			{
				this.inst.y = oldy;
				this.dy = 0;
				this.inst.set_bbox_changed();
				this.runtime.registerCollision(this.inst, collobj);
			}
			
			ax = cr.round6dp(this.dx);
			ay = cr.round6dp(this.dy);
			
			// Apply angle so long as object is still moving and isn't entirely blocked by a solid
			if (ax !== 0 || ay !== 0)
			{
				if (this.angleMode === 1)	// 90 degree intervals
					this.inst.angle = cr.to_clamped_radians(Math.round(cr.to_degrees(Math.atan2(ay, ax)) / 90.0) * 90.0);
				else if (this.angleMode === 2)	// 45 degree intervals
					this.inst.angle = cr.to_clamped_radians(Math.round(cr.to_degrees(Math.atan2(ay, ax)) / 45.0) * 45.0);
				else if (this.angleMode === 3)	// 360 degree
					this.inst.angle = Math.atan2(ay, ax);
			}
				
			this.inst.set_bbox_changed();
			
			if (this.inst.angle != oldangle)
			{
				collobj = this.runtime.testOverlapSolid(this.inst);
				if (collobj)
				{
					this.inst.angle = oldangle;
					this.inst.set_bbox_changed();
					this.runtime.registerCollision(this.inst, collobj);
				}
			}
		}
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.IsMoving = function ()
	{
		return this.dx !== 0 || this.dy !== 0;
	};
	
	cnds.CompareSpeed = function (cmp, s)
	{
		var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		
		return cr.do_cmp(speed, cmp, s);
	};
    
	cnds.OnExtraCtlPressed = function (name)
	{
        var is_my_call = (this.current_extra_ctlName == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	}; 
    
	cnds.OnExtraCtlReleased = function (name)
	{
        var is_my_call = (this.current_extra_ctlName == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	};
    
	cnds.IsExtraCtlDown = function (name)
	{
        var ret = false;
        var keycode, key_info;
        var key_extra_dict = this.KEY_EXTRA;
        for (keycode in key_extra_dict)
        {
            key_info = key_extra_dict[keycode];
            if ((key_info.name == name) && key_info.state)
            {
               ret = true;
               break;
            }
        }
		return ret;
	};
    

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.Stop = function ()
	{
		this.dx = 0;
		this.dy = 0;
	};
	
	acts.Reverse = function ()
	{
		this.dx *= -1;
		this.dy *= -1;
	};
	
	acts.SetIgnoreInput = function (ignoring)
	{
		this.ignoreInput = ignoring;
	};
	
	acts.SetSpeed = function (speed)
	{
		if (speed < 0)
			speed = 0;
		if (speed > this.maxspeed)
			speed = this.maxspeed;
			
		// Speed is new magnitude of vector of motion
		var a = Math.atan2(this.dy, this.dx);
		this.dx = speed * Math.cos(a);
		this.dy = speed * Math.sin(a);
	};
	
	acts.SetMaxSpeed = function (maxspeed)
	{
		this.maxspeed = maxspeed;
		
		if (this.maxspeed < 0)
			this.maxspeed = 0;
	};
	
	acts.SetAcceleration = function (acc)
	{
		this.acc = acc;
		
		if (this.acc < 0)
			this.acc = 0;
	};
	
	acts.SetDeceleration = function (dec)
	{
		this.dec = dec;
		
		if (this.dec < 0)
			this.dec = 0;
	};
	
	acts.SimulateControl = function (ctrl)
	{
		// 0=left, 1=right, 2=up, 3=down
		switch (ctrl) {
		case 0:		this.simleft = true;	break;
		case 1:		this.simright = true;	break;
		case 2:		this.simup = true;		break;
		case 3:		this.simdown = true;	break;
		}
	};
	
	acts.CfgCtl = function (ctrl, keycode)
	{
		// 0=left, 1=right, 2=up, 3=down
		switch (ctrl) {
		case 0:
            this.KEY_LEFT = keycode;
        break;
		case 1:
            this.KEY_RIGHT = keycode;    
        break;
		case 2:
            this.KEY_UP = keycode;
        break;
		case 3:
            this.KEY_DOWN = keycode;        
        break;
		}      
	};  

	acts.CfgExtraCtl = function (ctl_name, keycode)
	{
        // remove the existed keycode of ctl_name    
        var key;
        var key_hash = this.KEY_EXTRA;
        var find_key = null;
        for (key in key_hash)
        {
            if (key_hash[key].name == ctl_name)
            {
                find_key = key;
                break;
            }
        }
        if (find_key != null)
            delete this.KEY_EXTRA[find_key];  
            
		this.KEY_EXTRA[keycode] = {name:ctl_name, state:false};        
	}; 
	
	acts.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};	
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.Speed = function (ret)
	{
		ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
	};
	
	exps.MaxSpeed = function (ret)
	{
		ret.set_float(this.maxspeed);
	};
	
	exps.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	
	exps.Deceleration = function (ret)
	{
		ret.set_float(this.dec);
	};
	
	exps.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)));
	};
	
	exps.VectorX = function (ret)
	{
		ret.set_float(this.dx);
	};
	
	exps.VectorY = function (ret)
	{
		ret.set_float(this.dy);
	};
	
	exps.LEFT = function (ret)
	{
		ret.set_int(this.KEY_LEFT);
	};
	
	exps.RIGHT = function (ret)
	{
		ret.set_int(this.KEY_RIGHT);
	};   
	
	exps.UP = function (ret)
	{
		ret.set_int(this.KEY_UP);
	};
	
	exps.DOWN = function (ret)
	{
		ret.set_int(this.KEY_DOWN);
	};   
	
	exps.EXTRA = function (ret, name)
	{
        var val = 0;
        var keycode, key_info;
        var key_extra_dict = this.KEY_EXTRA;
        for (keycode in key_extra_dict)
        {
            key_info = key_extra_dict[keycode];
            if (key_info.name == name)
            {
               val = keycode;
               break;
            }
        }
		ret.set_int(parseInt(val));
	};
    
    
}());