﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Hash = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Hash.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
        this.exp_CurKey = "";
        this.exp_CurValue = 0;
        this._clean_all();  
        var init_data = this.properties[0];
        if (init_data != "")
            this._my_hash = JSON.parse(init_data);
	};
    
	instanceProto._clean_all = function()
	{
		this._my_hash = {};
        this._current_entry = this._my_hash;
	};    
        
	instanceProto._set_entry_byKeys = function(keys)
	{
        var key_len = keys.length;
        var i, key;
        var _entry = this._my_hash;
        for (i=0; i< key_len; i++)
        {
            key = keys[i];
            if ( (_entry[key] == null) ||
                 (typeof _entry[key] != "object") )
            {
                _entry[key] = {};
            }
            _entry = _entry[key];            
        }
        
        this._current_entry = _entry;
	};
    
	instanceProto._set_current_entey = function (key_string)
	{        
        if (key_string != "")
        {
            var keys = key_string.split(".");      
		    this._set_entry_byKeys(keys);
        }
        else
            this._current_entry = this._my_hash;
	};
    
	instanceProto._get_data = function(keys)
	{           
        var last_key = keys.splice(keys.length-1, 1);      
        this._set_entry_byKeys(keys);
        return this._current_entry[last_key];
	}; 
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.ForEachKey = function (key_string)
	{
        this._set_current_entey(key_string);
        var current_event = this.runtime.getCurrentEventStack().current_event;

        var key, value;
		for (key in this._current_entry)
	    {
            value = this._current_entry[key];
            if ((typeof value != "number") && (typeof value != "string"))
                continue;
                
            this.exp_CurKey = key;
            this.exp_CurValue = value;
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

        this.exp_CurKey = "";
        this.exp_CurValue = 0;      
		return false;
	}; 
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.SetByKeyString = function (key_string, val)
	{        
        if (key_string != "")
        {
		    var keys = key_string.split(".");             
            var last_key = keys.splice(keys.length-1, 1);      
            this._set_entry_byKeys(keys);
            this._current_entry[last_key] = val;
        }
	};

	acts.SetCurHashEntey = function (key_string)
	{        
        this._set_current_entey(key_string);
	};

	acts.SetValueInCurHashEntey = function (key_name, val)
	{        
        if (key_name != "")
        {
            this._current_entry[key_name] = val;
        }        
	};    

	acts.CleanAll = function ()
	{        
        this._clean_all();      
	};  

    acts.StringToHashTable = function (JSON_string)
	{  
        this._my_hash = JSON.parse(JSON_string);
	};  
    
    acts.RemoveByKeyString = function (key_string)
	{  
        if (key_string != "")
        {
		    var keys = key_string.split(".");             
            var last_key = keys.splice(keys.length-1, 1);      
            this._set_entry_byKeys(keys);
            delete this._current_entry[last_key];
        }
	};  
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.Hash = function (ret, key_string)
	{   
        var keys = (arguments.length > 2)?
                   Array.prototype.slice.call(arguments,1):
                   key_string.split(".");
        var val = this._get_data(keys);
		ret.set_any(val);
	};
    
	exps.At = function (ret, key_string)
	{     
        var keys = (arguments.length > 2)?
                   Array.prototype.slice.call(arguments,1):
                   key_string.split(".");
        var val = this._get_data(keys);
		ret.set_any(val);
	};
    
	exps.Entry = function (ret, key_name)
	{       
		ret.set_any(this._current_entry[key_name]);
	};

	exps.HashTableToString = function (ret)
	{
        var json_string = JSON.stringify(this._my_hash);
		ret.set_string(json_string);
	};  
	
	exps.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};  
    
	exps.CurValue = function (ret)
	{
		ret.set_any(this.exp_CurValue);
	};    
}());