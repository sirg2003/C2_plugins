﻿function GetBehaviorSettings()
{
	return {
		"name":			"Grid Move",
		"id":			"Rex_GridMove",
		"version":		"0.1",        
		"description":	"Move sprite to neighbor on board object",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target position", "", 
             "On {my} hit target", 
			 "Triggered when hit target position.", 
			 "OnHitTarget");
AddCondition(2,	cf_trigger, "On moving", "", "On {my} moving", 
             "Triggered when object moving.", "OnMoving");                          
AddCondition(3,	0, "Is moving", "", "Is {my} moving", "Test if object is moving.", "IsMoving");  
AddCondition(4,	cf_trigger, "On moving accepted", "Request", 
             "On {my} moving request accepted", "Triggered when moving request accepted.", "OnMovingRequestAccepted");                
AddCondition(5,	cf_trigger, "On moving rejected", "Request", 
             "On {my} moving request rejected", "Triggered when moving request rejected.", "OnMovingRequestRejected");                          
AddCondition(6,	0, "Moving accepted", "Request", "Is {my} moving request accepted", "Test if moving request accepted.", "IsMovingRequestAccepted");  
AddNumberParam("X offset", "Relatived X offset.",0);
AddNumberParam("Y offset", "Relatived Y offset.",0);
AddCondition(7,	0, "Can move to", "Test", "{my} can move to offset [<i>{0}</i>, <i>{1}</i>]", 
             "Test if object can move to relatived offset target.", "TestMoveToOffset");
AddNumberParam("Direction", "The direction of neighbor.", 0);		  
AddCondition(8, 0, "Can move to neighbor", "Request", "{my} can move to direction <i>{0}</i>", 
          "Test if object can move to neighbor.", "TestMoveToNeighbor");              
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Moving direction.", 0);              
AddCondition(9,	0, "Can move to neighbor", "Test: Square grid", "{my} can move to <i>{0}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");   
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);             
AddCondition(10, 0, "Can move to neighbor", "Test: Hexagon grid", "{my} can move to <i>{0}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");                     

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's Square-grid Move behavior.", "SetActivated");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Moving direction.", 0);
AddAction(1, 0, "Move to neighbor", "Request: Square grid", "{my} move to <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
AddNumberParam("X offset", "Relatived X offset.",0);
AddNumberParam("Y offset", "Relatived Y offset.",0);
AddAction(2, 0, "Move to offset", "Request", "{my} move to offset [<i>{0}</i>, <i>{1}</i>]", 
          "Move to relatived offset target.", "MoveToOffset");        
AddNumberParam("Max speed", "Maximum speed, in pixel per second.", 400);
AddAction(3, 0, "Set maximum speed", "Speed", 
          "Set {my} maximum speed to <i>{0}</i>", 
          "Set the object's maximum speed.", "SetMaxSpeed");
AddNumberParam("Acceleration", "The acceleration setting, in pixel per second per second.", 0);
AddAction(4, 0, "Set acceleration", "Speed", 
          "Set {my} acceleration to <i>{0}</i>", 
          "Set the object's acceleration.", "SetAcceleration");
AddNumberParam("Deceleration", "The deceleration setting, in pixels per second per second.", 0);
AddAction(5, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's deceleration.", "SetDeceleration");    
AddNumberParam("Current speed", "Current speed, in pixel per second.", 400);
AddAction(6, 0, "Set current speed", "Speed", 
          "Set {my} current speed to <i>{0}</i>", 
          "Set the object's Current speed.", "SetCurrentSpeed");                     
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddAction(9, 0, "Move to neighbor", "Request: Hexagon grid", "{my} move to <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
AddNumberParam("Direction", "The direction of neighbor.", 0);		  
AddAction(10, 0, "Move to neighbor", "Request", "{my} move to direction <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object speed, in pixel per second.");
AddExpression(2, ef_return_number, "Get max speed", "Setting", "MaxSpeed", 
              "The maximum speed setting, in pixel per second.");
AddExpression(3, ef_return_number, "Get acceleration", "Setting", "Acc", 
              "The acceleration setting, in pixel per second per second.");
AddExpression(4, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in pixel per second per second.");
AddExpression(5, ef_return_number, "Get target position X", "Target", "TargetX", 
              "The X co-ordinate of target position to move toward.");
AddExpression(6, ef_return_number, "Get target position Y", "Target", "TargetY", 
              "The Y co-ordinate of target position to move toward."); 
AddExpression(8, ef_return_number, "Get blocker UID", "Request", "BlockerUID", 
              "Get UID of blocker when moving request rejected.");
AddExpression(9, ef_return_number, "Get moving direction", "Request", "Direction", 
              "Get last moving direction of moving request.");
AddExpression(10, ef_return_number, "Get logic X of destination", "Request", "DestinationLX", 
              "Get logic X of destination X when moving request.");  
AddExpression(11, ef_return_number, "Get logic Y of destination", "Request", "DestinationLY", 
              "Get logic Y of destination when moving request.");  
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                    
	new cr.Property(ept_float, "Max speed", 400, "Maximum speed, in pixel per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in pixel per second per second."),    
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	if (this.properties["Max speed"] < 0)
		this.properties["Max speed"] = 0;
		
	if (this.properties["Acceleration"] < 0)
		this.properties["Acceleration"] = 0;
		
	if (this.properties["Deceleration"] < 0)
		this.properties["Deceleration"] = 0;
}
