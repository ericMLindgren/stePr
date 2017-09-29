// //FrameLib stuff
// var ACT = { //I think maybe actions should have no targets
// 					// and target should be inherent in acttype, like MOVE_FREE
// 					// or SHIFT_WEIGHT
// 	ROT_FOOT : "rotate one foot",
// 	ROT_BOD  : "rotate both feet around standing",
// 	MOVE     : "translate foot/weight in XY space",
// 	POINT    : "articulate the ankle"
// }

// function Action(type, amount, target){
// 	if (true){ //want to test valid act_type but enum is weird in JS BUG*
// 		this.type = type;
// 		this.amount = amount;
// 		this.target = target;
// 	}
// 	else {console.log('ERROR ', type);}
// }


// function Frame(actions, absolutes) {
// 	this.actions = actions; //Should be an array of Actions
// 	this.absolutes = absolutes; //This should be an object containing absolute 
// 								//position/rotation/yaw of each foot
// }

// function FrameData(xyPos, yawAngle, pitchAngle){
// 	this.xyPos = xyPos;
// 	this.yawAngle = yawAngle;
// 	this.pitchAngle = pitchAngle;
// }


// function FrameLib(){
// 	this.frames = {};
// }

//View CLASS Should contain objects, track/set frame number, facilitating animation
//Not sure where to keep key frame data, with dancer or individual objects
var UICOLORS = {
	frameStrokeSelected : 'blue',
	frameStrokeUnSelected : 'black'
}

function ViewController(frameCount, objects, containerView){



	this.focusedObj = null;
	this.userAction = 'none';

	this.FRAMECOUNT = typeof frameCount == 'undefined' ? 20 : frameCount;

	this.objects = typeof objects == 'undefined' ? [] : objects
	// if (objects == undefined) this.objects = [];
	// else this.objects = objects;

	this.currentFrame = 0; 
	this.uiFrameBoxes = [];

	//Init FrameLib
	this.frameLib = {};

	this.addObj = function(obToAdd){
		
		// obToAdd.applyMatrix = false; //It's important that all objects in view don't apply matrix but we'll handly this in object design rather than having the view enforce it

		//Add event handlers for object focus
		obToAdd.onMouseEnter = function(event) {
			if (this.focusedObj) this.focusedObj.selected = false;
			this.focusedObj = obToAdd;			
			obToAdd.selected = true;

		}.bind(this);

		this.objects.push(obToAdd); //Add object to contents list

		// obToAdd.onMouseLeave = function(event) {
		// 	this.focusedObj = null;
		// 	obToAdd.selected = false;

		// }.bind(this);

	}.bind(this);

	this.setFrame = function(frameNum){
		console.log(frameNum);
		if ((frameNum < 0) || (frameNum >= this.FRAMECOUNT)) return -1;
		this.currentFrame = frameNum;
		this.updateContents();
		this.updateUI();
		
	}.bind(this);

	this.logFrame = function(){

		// if (!(this.currentFrame in this.frameLib)){ //If there's no keyframe make a new blank. 
		if (!(this.currentFrame in this.frameLib)){
			this.frameLib[this.currentFrame] = {}
		}

		for (objI in this.objects){
			this.frameLib[this.currentFrame][this.objects[objI].id] = {}
			var thisEntry = this.frameLib[this.currentFrame][this.objects[objI].id];
			var thisObject = this.objects[objI];
			thisEntry.position = thisObject.position;
			thisEntry.yaw =  thisObject.rotation;
			// console.log("Entered yaw " + thisEntry.yaw);

		}
		this.updateUI();//make sure frames show new content

	}.bind(this);

	this.initUI = function(){
		// console.log('initing UI');



		//Create FrameUI View
		// console.log(this.FRAMECOUNT);
		for (var i = 0; i<this.FRAMECOUNT;i++){
		 
			var frame = new Path.Rectangle([10+15*i,550], [10,40]);

	
			if (i in this.frameLib){
				frame.fillColor = 'black';	
			} 
			else {
				frame.fillColor = 'grey';
			}


			frame.strokeWidth = 2;
			// if (i == this.currentFrame) frame.strokeColor = UICOLORS.frameStrokeSelected;
			// else frame.strokeColor = UICOLORS.frameStrokeUnSelected;

			(function (ind, whichframe, controller) { //Assign event handlers to all frames, closure is necessary to make sure iteration is handled correctly
				whichframe.idNum = ind;
				// alert(ind);
				whichframe.onClick = function(event){
					// console.log('frameNum: ' + whichframe.idNum + ' clicked');
					controller.setFrame(ind);
				}
			})(i, frame, this);

			this.uiFrameBoxes.push(frame);
		}
		//Frame Count
		
		this.frameText = new PointText({
		    point: [view.bounds.width-200, 50],
		    content: 'Frame: \n Action: ',
		    fillColor: 'black',
		    fontFamily: 'Courier New',
		    fontWeight: 'bold',
		    fontSize: 16
		});


	}.bind(this);

	this.updateUI = function(){
		for (var i in this.uiFrameBoxes){ //Update frame boxes			
			if (i == this.currentFrame) this.uiFrameBoxes[i].strokeColor = UICOLORS.frameStrokeSelected;
			else this.uiFrameBoxes[i].strokeColor = UICOLORS.frameStrokeUnSelected;

			if (i in this.frameLib){
					this.uiFrameBoxes[i].fillColor = 'black';	
				}
				else {
					this.uiFrameBoxes[i].fillColor = 'grey';
				}
		};

		this.frameText.content = 'Frame #: ' + this.currentFrame + "\nAction: " + this.userAction;
		console.log('UI Updated');
		// console.log(this.frameText.content);
	}.bind(this);

	this.updateContents = function(){
		if (this.currentFrame in this.frameLib){
			for (obIndex in this.objects){
				var thisOb = this.objects[obIndex];
				var thisEntry = this.frameLib[this.currentFrame][thisOb.id];


				thisOb.position = thisEntry.position;
				thisOb.rotation = thisEntry.yaw;
				// console.log("Setting object #: " + thisOb.id + " to position: " + thisEntry.position + "\nSetting rotation to: " + thisEntry.yaw);
			}
		}
		else {}//Interpolate


		// console.log(this.frameLib);
	}.bind(this);

	//INITIALIZE INTERFACE
	this.initUI();
	this.updateUI();

	//User Interaction Stuff:
	this.setAction = function(newAction){
		if (this.userAction == newAction) this.userAction = 'none';
		else {
			this.userAction = newAction;
		}
	}.bind(this);

	containerView.onKeyDown = function(event){
		// console.log(event.key + 'pressed');
		switch(event.key){
			case 'g':
				this.setAction('move');
				break;
			case 'r':
				this.setAction('rotate');
				break;
			case 'space':
				this.logFrame();
				break;
			case 'f':
				this.setFrame(this.currentFrame+1);
				break;
			case 'e':
				this.setFrame(this.currentFrame-1);
				break;
		}
		this.updateUI();
	}.bind(this);

	containerView.onMouseMove = function(event){
		switch (this.userAction){
			case 'move':
				this.focusedObj.position += event.delta;
				break;
			case 'rotate':
				this.focusedObj.rotation += event.delta.y;
				break;

		}
	}.bind(this);

}




function Button(rect, color, text, clickAction){
	this.rect = new Path.Rectangle(rect);
	this.rect.fillColor = color;
	this.rect.opacity = .6
	this.text = new PointText({
		    point: this.rect.position,
		    content: text,
		    fillColor: 'white',
		    fontFamily: 'Courier New',
		    fontWeight: 'bold',
		    fontSize: 16
		});

	this.text.position = this.rect.position //center align text to box;

	this.group = new Group(this.rect,this.text);

	this.group.onClick = clickAction;

	Object.defineProperty(this, 'position', {
		get: function(){
			return this.group.position;
		},
		set: function(value){
			// console.log('setter');
			this.group.position = value;
		}

	});
}

var buttonRect = new Rectangle(view.center,[100,40])
var button1 = new Button(buttonRect, 'blue', 'Test', function(){alert('test')});

var button2 = new Button(buttonRect, 'red', 'log', function(event){mainView.logFrame();});

button1.position = [60,30] //TODO (location should be set in constructor maybe change the rect parameter)
button2.position = [60,80]

	
var mainView = new ViewController(50, null, view);


var obj1 = new paper.Path.Rectangle(view.center, [50,150])
obj1.fillColor = 'black';
mainView.addObj(obj1);


// onMouseMove = function(event){
// 	obj1.position += event.delta;
// }




//Proto Foot Class to allow pitch shading to indicate footsteps, still need to figure out how to hand when rotated out of cardinal directions...


function Foot(position){

	var startPos = typeof position == 'undefined' ? view.center : position;
	this.pitch = 0;

	this.shadowRep = new paper.Path.Rectangle(view.center, [20,60])
	shadowRep.position = startPos; //no need to keep class position as we can just return one of the element's xy's same goes for yaw, since pitch is not maintained by paperjs we need our own.
	shadowRep.applyMatrix = false; //Only have to do this once since all members are clones of shadowRep

	this.footRep = shadowRep.clone();
	this.shadowRep.opacity = .2;

	this.shadowRep.fillColor = 'grey';
	this.footRep.fillColor = 'black';

	this.footMask = footRep.clone();

	var footGroup = new Group(footMask,footRep);
	footGroup.clipped = true;

}



Object.defineProperty(Foot, 'position', {
	get: function() {
		return this.footRep.position;
	},
	set: function(value) {
		this.footRep.position = value;
		this.shadowRep.position = value;
	}
});

Object.defineProperty(Foot, 'pitch', {
	get: function() {
		return this.footRep.rotation;
	},
	set: function(value) {
		this.pitch = value;
		if (this.pitch == 0) {//Mostly feet will be flat
		}
		else if (this.pitch<0){//When not flat likely to tilt back
		}
		else if (this.pitch>0){//But somtimes they're pointed forward
		}


	}
});

Object.defineProperty(Foot, 'yaw', {
	get: function() {
		return this.yaw;
	},
	set: function(value) {
		this.pitch = value;
		if (this.pitch == 0) {//Mostly feet will be flat
		}
		else if (this.pitch<0){//When not flat likely to tilt back
		}
		else if (this.pitch>0){//But somtimes they're pointed forward
		}


	}
});