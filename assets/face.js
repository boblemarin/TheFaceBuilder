var stage,
	EMPTY_TOUCH = -999,
	z = 1,
	mouseTarget,
	simulateMultitouch = false,
	numTargets = 6;
		
function init() {
	// prepare the stage
	stage = Sprite3D.stage( document.body );

	// wraps divs with sprite3D objects
	for( var i = 0; i < numTargets; i++ )
	{
		new Sprite3D( document.getElementById( "img" + (i+1) ) )
			.origin( 0, 0, 0 )
			.transformOrigin( "0%", "0%" )
			.position( 20, 20, 0 )
			.rotateFirst(false)
			.addEventListener( "touchstart", onTouchStart )
			.addEventListener( "touchmove", onTouchMove )
			.addEventListener( "touchend", onTouchEnd )
			.addEventListener( "mousedown", onMouseDown )
			.set( 'numTouches', 0 )
			.set( 'touch1ID', EMPTY_TOUCH )
			.set( 'touch2ID', EMPTY_TOUCH )
			.set( 'angle', 0 )
			.set( 'distance', 1 )
			.update();
	}
	
	if ( !('ontouchstart' in window) ) {
		document.getElementById("warning").style.display = "block";
		document.addEventListener( "keydown", onKeyDown, false );
	}
	
	// listen for document touch to prevent scrolling behavior
	document.addEventListener( "touchstart", onDocumentTouchStart, false );
}	

function onDocumentTouchStart( event, target ) {
	// prevent user from scrolling the page
	event.preventDefault();
}

function onTouchStart( event, target ) {
	var ts = event.changedTouches,
		n = ts.length,
		t,i=0;

	for(i;i<n;i++){
		t = ts[i];
		switch( target.numTouches ) {
			case 0:
				target.className( "selected" );
				target.css( "zIndex", z++ );
				target.touch1X = t.pageX;
				target.touch1Y = t.pageY;
				target.touch1ID = t.identifier;
				target.numTouches = 1;
				break;
			case 1:
				target.className( "selected2" );
				target.touch2X = t.pageX;
				target.touch2Y = t.pageY;
				target.touch2ID = t.identifier;
				target.numTouches = 2;
				target.touchAngle = Math.atan2( target.touch2Y - target.touch1Y, target.touch2X - target.touch1X );
				target.touchDistance = distance( target.touch2X - target.touch1X, target.touch2Y - target.touch1Y );
				target.angle = Math.atan2( target.y() - target.touch1Y, target.x() - target.touch1X );
				target.distance = distance( target.x() - target.touch1X, target.y() - target.touch1Y );
				target.startRotation = target.rotationZ();
				target.startScale = target.scaleX();
				break;
		}
	}
	event.preventDefault();
}

function onTouchMove( event, target ) {
	var ta = event.changedTouches, 
		n = ta.length,
		t, px, py;
	
	switch( target.numTouches )
	{
		case 1: 
			while( n-- ) {
				t = ta[n];
				if ( t.identifier == target.touch1ID )
				{
					px = t.pageX;
					py = t.pageY;
					target.move( px - target.touch1X, py - target.touch1Y ).update();
					target.touch1X = px;
					target.touch1Y = py;
					continue;
				}
			}
			break;
			
		case 2:
			// update touch positions
			while( n-- ) {
				t = ta[n];
				if ( t.identifier == target.touch1ID )
				{
					target.touch1X = t.pageX;
					target.touch1Y = t.pageY;
				}
				else if ( t.identifier == target.touch2ID )
				{
					target.touch2X = t.pageX;
					target.touch2Y = t.pageY;
				}
			}
			
			// compute new position
			var modAngle = Math.atan2( target.touch2Y - target.touch1Y, target.touch2X - target.touch1X ) - target.touchAngle,
				modDistance = distance( target.touch2X - target.touch1X, target.touch2Y - target.touch1Y ) / target.touchDistance,
				newCornerAngle = target.angle + modAngle,
				newCornerDistance = target.distance * modDistance;
			target
				.position( 
					target.touch1X + Math.cos( newCornerAngle ) * newCornerDistance,
					target.touch1Y + Math.sin( newCornerAngle ) * newCornerDistance,
					0 )
				.scale( target.startScale * modDistance )
				.rotationZ( target.startRotation + ( modAngle / Math.PI * 180 ) )
				.update();
			break;
	}
	event.preventDefault();
}

function onTouchEnd( event, target ) {
	var t, ta = event.changedTouches;
	n = ta.length;
	while( n-- )
	{
		t = ta[n];
		
		if ( t.identifier == target.touch2ID )
		{
			//debug.innerHTML = "released touch2 id " + t.identifier;
			target.touch2ID = EMPTY_TOUCH;
			target.numTouches = 1;
		}
		else if ( t.identifier == target.touch1ID )
		{
			if ( target.touch2ID != EMPTY_TOUCH )
			{
				//debug.innerHTML = "released touch1 id " + t.identifier;
				target.touch1X = target.touch2X;
				target.touch1Y = target.touch2Y;
				target.touch1ID = target.touch2ID;
				target.touch2ID = EMPTY_TOUCH;
				target.numTouches = 1;
			}
			else
			{
				//debug.innerHTML = "released touch1 id " + t.identifier;
				target.touch1ID = EMPTY_TOUCH;
				target.numTouches = 0;
			}
		}
	} 
	
	switch( target.numTouches )
	{
		case 2:
			target.className( "selected2" );
			break;
		case 1:
			target.className( "selected" );
			break;
		case 0:
			target.className( "" );
			break;
	}
	event.preventDefault();
}

function onMouseDown( event, target ) {
	if ( mouseTarget == null ) {
		target.className( "selected" );
		target.css( "zIndex", z+=5 );
		target.touch1X = event.pageX;
		target.touch1Y = event.pageY;
		target.touch1ID = 999;
		target.numTouches = 1;
		mouseTarget = target;
		document.addEventListener("mousemove", onDocumentMouseMove, false );
		document.addEventListener("mouseup", onDocumentMouseUp, false );
		console.log( target.css() );
	}
	event.preventDefault();
}

function onDocumentMouseMove( event ) {
	if ( simulateMultitouch ) {
		// update positions
		mouseTarget.touch1X = event.pageX;
		mouseTarget.touch1Y = event.pageY;
		
		// compute new position
		var modAngle = Math.atan2( mouseTarget.touch2Y - mouseTarget.touch1Y, mouseTarget.touch2X - mouseTarget.touch1X ) - mouseTarget.touchAngle,
			modDistance = distance( mouseTarget.touch2X - mouseTarget.touch1X, mouseTarget.touch2Y - mouseTarget.touch1Y ) / mouseTarget.touchDistance,
			newCornerAngle = mouseTarget.angle + modAngle,
			newCornerDistance = mouseTarget.distance * modDistance;
		mouseTarget
			.position( 
				mouseTarget.touch1X + Math.cos( newCornerAngle ) * newCornerDistance,
				mouseTarget.touch1Y + Math.sin( newCornerAngle ) * newCornerDistance,
				0 )
			.scale( mouseTarget.startScale * modDistance )
			.rotationZ( mouseTarget.startRotation + ( modAngle / Math.PI * 180 ) )
			.update();
	} else {
		px = event.pageX;
		py = event.pageY;
		mouseTarget.move( px - mouseTarget.touch1X, py - mouseTarget.touch1Y ).update();
		mouseTarget.touch1X = px;
		mouseTarget.touch1Y = py;
	}
	event.preventDefault();
}

function onDocumentMouseUp( event ) {
	mouseTarget.touch1ID = EMPTY_TOUCH;
	mouseTarget.numTouches = 0;
	mouseTarget.className( "" );
	mouseTarget = null;
	document.removeEventListener("mousemove", onDocumentMouseMove, false );
	document.removeEventListener("mouseup", onDocumentMouseUp, false );
	if ( simulateMultitouch ) {
		simulateMultitouch = false;
		document.removeEventListener( "keyup", onKeyUp, false );
	}
	event.preventDefault();
}

function onKeyDown( event ) {
	if ( mouseTarget != null && simulateMultitouch == false ) {
		simulateMultitouch = true;
		document.addEventListener( "keyup", onKeyUp, false );
		mouseTarget.className( "selected2" );
		
		mouseTarget.touch2X = mouseTarget.x();
		mouseTarget.touch2Y = mouseTarget.y();
		mouseTarget.numTouches = 2;
		mouseTarget.touchAngle = Math.atan2( mouseTarget.touch2Y - mouseTarget.touch1Y, mouseTarget.touch2X - mouseTarget.touch1X );
		mouseTarget.touchDistance = distance( mouseTarget.touch2X - mouseTarget.touch1X, mouseTarget.touch2Y - mouseTarget.touch1Y );
		mouseTarget.angle = Math.atan2( mouseTarget.y() - mouseTarget.touch1Y, mouseTarget.x() - mouseTarget.touch1X );
		mouseTarget.distance = distance( mouseTarget.x() - mouseTarget.touch1X, mouseTarget.y() - mouseTarget.touch1Y );
		mouseTarget.startRotation = mouseTarget.rotationZ();
		mouseTarget.startScale = mouseTarget.scaleX();
		e.preventDefault();
	}
}

function onKeyUp( event ) {
	mouseTarget.className("selected");
	simulateMultitouch = false;
	document.removeEventListener( "keyup", onKeyUp, false );
}

function distance( dx, dy )
{
	return Math.sqrt( dx * dx + dy * dy );
}
