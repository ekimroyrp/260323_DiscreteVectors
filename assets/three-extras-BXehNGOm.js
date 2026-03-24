import{C as kt,V as M,M as re,T as ne,Q as lt,S as mt,a as P,R as jt,P as Ht,b as ye,c as _e,d as ut,B as Q,e as Gt,f as tt,g as Vt,N as Yt,h as Wt,I as Kt,D as Xt,i as Oe,j as Zt,k as gt,l as qt,m as Qt,n as Jt,o as $t,L as es,p as ts,q as ss,r as is,s as ns,t as os,u as rs,v as se,w as Pe,U as we,x as Ue,y as as,F as Be,z as ct,A as oe,W as ls,E as dt,G as Rt,H as Ct,J as be,K as cs,O as hs,X as us,Y as Ie,Z as Ne,_ as ds,$ as fs,a0 as ps,a1 as ms}from"./three-core-DuGfpx6-.js";const xt={type:"change"},ft={type:"start"},Pt={type:"end"},De=new jt,yt=new Ht,gs=Math.cos(70*ye.DEG2RAD),I=new M,k=2*Math.PI,A={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},st=1e-6;class hi extends kt{constructor(e,t=null){super(e,t),this.state=A.NONE,this.target=new M,this.cursor=new M,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:re.ROTATE,MIDDLE:re.DOLLY,RIGHT:re.PAN},this.touches={ONE:ne.ROTATE,TWO:ne.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new M,this._lastQuaternion=new lt,this._lastTargetPosition=new M,this._quat=new lt().setFromUnitVectors(e.up,new M(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new mt,this._sphericalDelta=new mt,this._scale=1,this._panOffset=new M,this._rotateStart=new P,this._rotateEnd=new P,this._rotateDelta=new P,this._panStart=new P,this._panEnd=new P,this._panDelta=new P,this._dollyStart=new P,this._dollyEnd=new P,this._dollyDelta=new P,this._dollyDirection=new M,this._mouse=new P,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ys.bind(this),this._onPointerDown=xs.bind(this),this._onPointerUp=_s.bind(this),this._onContextMenu=Ms.bind(this),this._onMouseWheel=bs.bind(this),this._onKeyDown=Ss.bind(this),this._onTouchStart=vs.bind(this),this._onTouchMove=Es.bind(this),this._onMouseDown=ws.bind(this),this._onMouseMove=Ts.bind(this),this._interceptControlDown=As.bind(this),this._interceptControlUp=Ds.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(xt),this.update(),this.state=A.NONE}update(e=null){const t=this.object.position;I.copy(t).sub(this.target),I.applyQuaternion(this._quat),this._spherical.setFromVector3(I),this.autoRotate&&this.state===A.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=k:i>Math.PI&&(i-=k),s<-Math.PI?s+=k:s>Math.PI&&(s-=k),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let n=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),n=o!=this._spherical.radius}if(I.setFromSpherical(this._spherical),I.applyQuaternion(this._quatInverse),t.copy(this.target).add(I),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const r=I.length();o=this._clampDistance(r*this._scale);const l=r-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),n=!!l}else if(this.object.isOrthographicCamera){const r=new M(this._mouse.x,this._mouse.y,0);r.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),n=l!==this.object.zoom;const c=new M(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(r),this.object.updateMatrixWorld(),o=I.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(De.origin.copy(this.object.position),De.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(De.direction))<gs?this.object.lookAt(this.target):(yt.setFromNormalAndCoplanarPoint(this.object.up,this.target),De.intersectPlane(yt,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),n=!0)}return this._scale=1,this._performCursorZoom=!1,n||this._lastPosition.distanceToSquared(this.object.position)>st||8*(1-this._lastQuaternion.dot(this.object.quaternion))>st||this._lastTargetPosition.distanceToSquared(this.target)>st?(this.dispatchEvent(xt),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?k/60*this.autoRotateSpeed*e:k/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){I.setFromMatrixColumn(t,0),I.multiplyScalar(-e),this._panOffset.add(I)}_panUp(e,t){this.screenSpacePanning===!0?I.setFromMatrixColumn(t,1):(I.setFromMatrixColumn(t,0),I.crossVectors(this.object.up,I)),I.multiplyScalar(e),this._panOffset.add(I)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;I.copy(s).sub(this.target);let n=I.length();n*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*n/i.clientHeight,this.object.matrix),this._panUp(2*t*n/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,n=t-i.top,o=i.width,r=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(n/r)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(k*this._rotateDelta.x/t.clientHeight),this._rotateUp(k*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(k*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-k*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(k*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-k*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,n=Math.sqrt(i*i+s*s);this._dollyStart.set(0,n)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),n=.5*(e.pageY+i.y);this._rotateEnd.set(s,n)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(k*this._rotateDelta.x/t.clientHeight),this._rotateUp(k*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,n=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,n),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,r=(e.pageY+t.y)*.5;this._updateZoomParameters(o,r)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new P,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function xs(a){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(a.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(a)&&(this._addPointer(a),a.pointerType==="touch"?this._onTouchStart(a):this._onMouseDown(a)))}function ys(a){this.enabled!==!1&&(a.pointerType==="touch"?this._onTouchMove(a):this._onMouseMove(a))}function _s(a){switch(this._removePointer(a),this._pointers.length){case 0:this.domElement.releasePointerCapture(a.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Pt),this.state=A.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function ws(a){let e;switch(a.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case re.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(a),this.state=A.DOLLY;break;case re.ROTATE:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=A.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=A.ROTATE}break;case re.PAN:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=A.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=A.PAN}break;default:this.state=A.NONE}this.state!==A.NONE&&this.dispatchEvent(ft)}function Ts(a){switch(this.state){case A.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(a);break;case A.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(a);break;case A.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(a);break}}function bs(a){this.enabled===!1||this.enableZoom===!1||this.state!==A.NONE||(a.preventDefault(),this.dispatchEvent(ft),this._handleMouseWheel(this._customWheelEvent(a)),this.dispatchEvent(Pt))}function Ss(a){this.enabled!==!1&&this._handleKeyDown(a)}function vs(a){switch(this._trackPointer(a),this._pointers.length){case 1:switch(this.touches.ONE){case ne.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(a),this.state=A.TOUCH_ROTATE;break;case ne.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(a),this.state=A.TOUCH_PAN;break;default:this.state=A.NONE}break;case 2:switch(this.touches.TWO){case ne.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(a),this.state=A.TOUCH_DOLLY_PAN;break;case ne.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(a),this.state=A.TOUCH_DOLLY_ROTATE;break;default:this.state=A.NONE}break;default:this.state=A.NONE}this.state!==A.NONE&&this.dispatchEvent(ft)}function Es(a){switch(this._trackPointer(a),this.state){case A.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(a),this.update();break;case A.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(a),this.update();break;case A.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(a),this.update();break;case A.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(a),this.update();break;default:this.state=A.NONE}}function Ms(a){this.enabled!==!1&&a.preventDefault()}function As(a){a.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Ds(a){a.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const _t={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class ht{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new Fs(e)}),this.register(function(e){return new ks(e)}),this.register(function(e){return new Vs(e)}),this.register(function(e){return new Ys(e)}),this.register(function(e){return new Ws(e)}),this.register(function(e){return new Ks(e)}),this.register(function(e){return new js(e)}),this.register(function(e){return new Hs(e)}),this.register(function(e){return new Gs(e)}),this.register(function(e){return new Xs(e)}),this.register(function(e){return new Zs(e)}),this.register(function(e){return new qs(e)}),this.register(function(e){return new Qs(e)}),this.register(function(e){return new Js(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,i,s){const n=new Bs,o=[];for(let r=0,l=this.pluginCallbacks.length;r<l;r++)o.push(this.pluginCallbacks[r](n));n.setPlugins(o),n.setTextureUtils(this.textureUtils),n.writeAsync(e,t,s).catch(i)}parseAsync(e,t){const i=this;return new Promise(function(s,n){i.parse(e,s,n,t)})}}const _={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},it="KHR_mesh_quantization",j={};j[Qt]=_.NEAREST;j[Jt]=_.NEAREST_MIPMAP_NEAREST;j[$t]=_.NEAREST_MIPMAP_LINEAR;j[es]=_.LINEAR;j[ts]=_.LINEAR_MIPMAP_NEAREST;j[ss]=_.LINEAR_MIPMAP_LINEAR;j[is]=_.CLAMP_TO_EDGE;j[ns]=_.REPEAT;j[os]=_.MIRRORED_REPEAT;const wt={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},Ls=new _e,Tt=12,Rs=1179937895,Cs=2,bt=8,Ps=1313821514,Us=5130562;function xe(a,e){return a.length===e.length&&a.every(function(t,i){return t===e[i]})}function Is(a){return new TextEncoder().encode(a).buffer}function Ns(a){return xe(a.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function zs(a,e,t){const i={min:new Array(a.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(a.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let n=0;n<a.itemSize;n++){let o;a.itemSize>4?o=a.array[s*a.itemSize+n]:(n===0?o=a.getX(s):n===1?o=a.getY(s):n===2?o=a.getZ(s):n===3&&(o=a.getW(s)),a.normalized===!0&&(o=ye.normalize(o,a.array))),i.min[n]=Math.min(i.min[n],o),i.max[n]=Math.max(i.max[n],o)}return i}function Ut(a){return Math.ceil(a/4)*4}function nt(a,e=0){const t=Ut(a.byteLength);if(t!==a.byteLength){const i=new Uint8Array(t);if(i.set(new Uint8Array(a)),e!==0)for(let s=a.byteLength;s<t;s++)i[s]=e;return i.buffer}return a}function St(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function Os(a,e){if(typeof OffscreenCanvas<"u"&&a instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),a.convertToBlob({type:e,quality:t})}else return new Promise(t=>a.toBlob(t,e))}class Bs{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+Gt}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,i={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},i),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);const s=this,n=s.buffers,o=s.json;i=s.options;const r=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(n,{type:"application/octet-stream"}),u=Object.keys(r),h=Object.keys(l);if(u.length>0&&(o.extensionsUsed=u),h.length>0&&(o.extensionsRequired=h),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),i.binary===!0){const p=new FileReader;p.readAsArrayBuffer(c),p.onloadend=function(){const d=nt(p.result),g=new DataView(new ArrayBuffer(bt));g.setUint32(0,d.byteLength,!0),g.setUint32(4,Us,!0);const m=nt(Is(JSON.stringify(o)),32),x=new DataView(new ArrayBuffer(bt));x.setUint32(0,m.byteLength,!0),x.setUint32(4,Ps,!0);const E=new ArrayBuffer(Tt),w=new DataView(E);w.setUint32(0,Rs,!0),w.setUint32(4,Cs,!0);const v=Tt+x.byteLength+m.byteLength+g.byteLength+d.byteLength;w.setUint32(8,v,!0);const f=new Blob([E,x,m,g,d],{type:"application/octet-stream"}),y=new FileReader;y.readAsArrayBuffer(f),y.onloadend=function(){t(y.result)}}}else if(o.buffers&&o.buffers.length>0){const p=new FileReader;p.readAsDataURL(c),p.onloadend=function(){const d=p.result;o.buffers[0].uri=d,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const i=this.options,s=this.extensionsUsed;try{const n=JSON.parse(JSON.stringify(e.userData));if(i.includeCustomExtensions&&n.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const o in n.gltfExtensions)t.extensions[o]=n.gltfExtensions[o],s[o]=!0;delete n.gltfExtensions}Object.keys(n).length>0&&(t.extras=n)}catch(n){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+n.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const i=new M;for(let s=0,n=e.count;s<n;s++)if(Math.abs(i.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const i=e.clone(),s=new M;for(let n=0,o=i.count;n<o;n++)s.fromBufferAttribute(i,n),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),i.setXYZ(n,s.x,s.y,s.z);return t.attributesNormalized.set(e,i),i}applyTextureTransform(e,t){let i=!1;const s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),i=!0),t.rotation!==0&&(s.rotation=t.rotation,i=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),i=!0),i&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function i(d){return d.colorSpace===qt?function(m){return m<.04045?m*.0773993808:Math.pow(m*.9478672986+.0521327014,2.4)}:function(m){return m}}e instanceof tt&&(e=await this.decompressTextureAsync(e)),t instanceof tt&&(t=await this.decompressTextureAsync(t));const s=e?e.image:null,n=t?t.image:null,o=Math.max(s?s.width:0,n?n.width:0),r=Math.max(s?s.height:0,n?n.height:0),l=St();l.width=o,l.height=r;const c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,r);const u=c.getImageData(0,0,o,r);if(s){c.drawImage(s,0,0,o,r);const d=i(e),g=c.getImageData(0,0,o,r).data;for(let m=2;m<g.length;m+=4)u.data[m]=d(g[m]/256)*256}if(n){c.drawImage(n,0,0,o,r);const d=i(t),g=c.getImageData(0,0,o,r).data;for(let m=1;m<g.length;m+=4)u.data[m]=d(g[m]/256)*256}c.putImageData(u,0,0);const p=(e||t).clone();return p.source=new Vt(l),p.colorSpace=Yt,p.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),p}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){const t=this.json,i=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),i.push(e),0}processBufferView(e,t,i,s,n){const o=this.json;o.bufferViews||(o.bufferViews=[]);let r;switch(t){case _.BYTE:case _.UNSIGNED_BYTE:r=1;break;case _.SHORT:case _.UNSIGNED_SHORT:r=2;break;default:r=4}let l=e.itemSize*r;n===_.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);const c=Ut(s*l),u=new DataView(new ArrayBuffer(c));let h=0;for(let g=i;g<i+s;g++){for(let m=0;m<e.itemSize;m++){let x;e.itemSize>4?x=e.array[g*e.itemSize+m]:(m===0?x=e.getX(g):m===1?x=e.getY(g):m===2?x=e.getZ(g):m===3&&(x=e.getW(g)),e.normalized===!0&&(x=ye.normalize(x,e.array))),t===_.FLOAT?u.setFloat32(h,x,!0):t===_.INT?u.setInt32(h,x,!0):t===_.UNSIGNED_INT?u.setUint32(h,x,!0):t===_.SHORT?u.setInt16(h,x,!0):t===_.UNSIGNED_SHORT?u.setUint16(h,x,!0):t===_.BYTE?u.setInt8(h,x):t===_.UNSIGNED_BYTE&&u.setUint8(h,x),h+=r}h%l!==0&&(h+=l-h%l)}const p={buffer:this.processBuffer(u.buffer),byteOffset:this.byteOffset,byteLength:c};return n!==void 0&&(p.target=n),n===_.ARRAY_BUFFER&&(p.byteStride=l),this.byteOffset+=c,o.bufferViews.push(p),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,i=t.json;return i.bufferViews||(i.bufferViews=[]),new Promise(function(s){const n=new FileReader;n.readAsArrayBuffer(e),n.onloadend=function(){const o=nt(n.result),r={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(i.bufferViews.push(r)-1)}})}processAccessor(e,t,i,s){const n=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let r;if(e.array.constructor===Float32Array)r=_.FLOAT;else if(e.array.constructor===Int32Array)r=_.INT;else if(e.array.constructor===Uint32Array)r=_.UNSIGNED_INT;else if(e.array.constructor===Int16Array)r=_.SHORT;else if(e.array.constructor===Uint16Array)r=_.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)r=_.BYTE;else if(e.array.constructor===Uint8Array)r=_.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(i===void 0&&(i=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;const l=zs(e,i,s);let c;t!==void 0&&(c=e===t.index?_.ELEMENT_ARRAY_BUFFER:_.ARRAY_BUFFER);const u=this.processBufferView(e,r,i,s,c),h={bufferView:u.id,byteOffset:u.byteOffset,componentType:r,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(h.normalized=!0),n.accessors||(n.accessors=[]),n.accessors.push(h)-1}processImage(e,t,i,s="image/png"){if(e!==null){const n=this,o=n.cache,r=n.json,l=n.options,c=n.pending;o.images.has(e)||o.images.set(e,{});const u=o.images.get(e),h=s+":flipY/"+i.toString();if(u[h]!==void 0)return u[h];r.images||(r.images=[]);const p={mimeType:s},d=St();d.width=Math.min(e.width,l.maxTextureSize),d.height=Math.min(e.height,l.maxTextureSize);const g=d.getContext("2d",{willReadFrequently:!0});if(i===!0&&(g.translate(0,d.height),g.scale(1,-1)),e.data!==void 0){t!==Wt&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const x=new Uint8ClampedArray(e.height*e.width*4);for(let E=0;E<x.length;E+=4)x[E+0]=e.data[E+0],x[E+1]=e.data[E+1],x[E+2]=e.data[E+2],x[E+3]=e.data[E+3];g.putImageData(new ImageData(x,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)g.drawImage(e,0,0,d.width,d.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(Os(d,s).then(x=>n.processBufferViewImage(x)).then(x=>{p.bufferView=x})):p.uri=Kt.getDataURL(d,s);const m=r.images.push(p)-1;return u[h]=m,m}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const i={magFilter:j[e.magFilter],minFilter:j[e.minFilter],wrapS:j[e.wrapS],wrapT:j[e.wrapT]};return t.samplers.push(i)-1}async processTextureAsync(e){const i=this.options,s=this.cache,n=this.json;if(s.textures.has(e))return s.textures.get(e);n.textures||(n.textures=[]),e instanceof tt&&(e=await this.decompressTextureAsync(e,i.maxTextureSize));let o=e.userData.mimeType;o==="image/webp"&&(o="image/png");const r={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,o)};e.name&&(r.name=e.name),await this._invokeAllAsync(async function(c){c.writeTexture&&await c.writeTexture(e,r)});const l=n.textures.push(r)-1;return s.textures.set(e,l),l}async processMaterialAsync(e){const t=this.cache,i=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;i.materials||(i.materials=[]);const s={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const n=e.color.toArray().concat([e.opacity]);if(xe(n,[1,1,1,1])||(s.pbrMetallicRoughness.baseColorFactor=n),e.isMeshStandardMaterial?(s.pbrMetallicRoughness.metallicFactor=e.metalness,s.pbrMetallicRoughness.roughnessFactor=e.roughness):(s.pbrMetallicRoughness.metallicFactor=0,s.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){const r=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),l={index:await this.processTextureAsync(r),texCoord:r.channel};this.applyTextureTransform(l,r),s.pbrMetallicRoughness.metallicRoughnessTexture=l}if(e.map){const r={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(r,e.map),s.pbrMetallicRoughness.baseColorTexture=r}if(e.emissive){const r=e.emissive;if(Math.max(r.r,r.g,r.b)>0&&(s.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const c={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(c,e.emissiveMap),s.emissiveTexture=c}}if(e.normalMap){const r={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(r.scale=e.normalScale.x),this.applyTextureTransform(r,e.normalMap),s.normalTexture=r}if(e.aoMap){const r={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(r.strength=e.aoMapIntensity),this.applyTextureTransform(r,e.aoMap),s.occlusionTexture=r}e.transparent?s.alphaMode="BLEND":e.alphaTest>0&&(s.alphaMode="MASK",s.alphaCutoff=e.alphaTest),e.side===Xt&&(s.doubleSided=!0),e.name!==""&&(s.name=e.name),this.serializeUserData(e,s),await this._invokeAllAsync(async function(r){r.writeMaterialAsync&&await r.writeMaterialAsync(e,s)});const o=i.materials.push(s)-1;return t.materials.set(e,o),o}async processMeshAsync(e){const t=this.cache,i=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let f=0,y=e.material.length;f<y;f++)s.push(e.material[f].uuid);else s.push(e.material.uuid);const n=s.join(":");if(t.meshes.has(n))return t.meshes.get(n);const o=e.geometry;let r;e.isLineSegments?r=_.LINES:e.isLineLoop?r=_.LINE_LOOP:e.isLine?r=_.LINE_STRIP:e.isPoints?r=_.POINTS:r=e.material.wireframe?_.LINES:_.TRIANGLES;const l={},c={},u=[],h=[],p={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},d=o.getAttribute("normal");d!==void 0&&!this.isNormalizedNormalAttribute(d)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(d)));let g=null;for(let f in o.attributes){if(f.slice(0,5)==="morph")continue;const y=o.attributes[f];if(f=p[f]||f.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(f)||(f="_"+f),t.attributes.has(this.getUID(y))){c[f]=t.attributes.get(this.getUID(y));continue}g=null;const T=y.array;f==="JOINTS_0"&&!(T instanceof Uint16Array)&&!(T instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),g=new Q(new Uint16Array(T),y.itemSize,y.normalized)):(T instanceof Uint32Array||T instanceof Int32Array)&&!f.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${f}" converted to type FLOAT.`),g=ht.Utils.toFloat32BufferAttribute(y));const L=this.processAccessor(g||y,o);L!==null&&(f.startsWith("_")||this.detectMeshQuantization(f,y),c[f]=L,t.attributes.set(this.getUID(y),L))}if(d!==void 0&&o.setAttribute("normal",d),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const f=[],y=[],b={};if(e.morphTargetDictionary!==void 0)for(const T in e.morphTargetDictionary)b[e.morphTargetDictionary[T]]=T;for(let T=0;T<e.morphTargetInfluences.length;++T){const L={};let R=!1;for(const D in o.morphAttributes){if(D!=="position"&&D!=="normal"){R||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),R=!0);continue}const S=o.morphAttributes[D][T],C=D.toUpperCase(),N=o.attributes[D];if(t.attributes.has(this.getUID(S,!0))){L[C]=t.attributes.get(this.getUID(S,!0));continue}const G=S.clone();if(!o.morphTargetsRelative)for(let U=0,J=S.count;U<J;U++)for(let H=0;H<S.itemSize;H++)H===0&&G.setX(U,S.getX(U)-N.getX(U)),H===1&&G.setY(U,S.getY(U)-N.getY(U)),H===2&&G.setZ(U,S.getZ(U)-N.getZ(U)),H===3&&G.setW(U,S.getW(U)-N.getW(U));L[C]=this.processAccessor(G,o),t.attributes.set(this.getUID(N,!0),L[C])}h.push(L),f.push(e.morphTargetInfluences[T]),e.morphTargetDictionary!==void 0&&y.push(b[T])}l.weights=f,y.length>0&&(l.extras={},l.extras.targetNames=y)}const m=Array.isArray(e.material);if(m&&o.groups.length===0)return null;let x=!1;if(m&&o.index===null){const f=[];for(let y=0,b=o.attributes.position.count;y<b;y++)f[y]=y;o.setIndex(f),x=!0}const E=m?e.material:[e.material],w=m?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let f=0,y=w.length;f<y;f++){const b={mode:r,attributes:c};if(this.serializeUserData(o,b),h.length>0&&(b.targets=h),o.index!==null){let L=this.getUID(o.index);(w[f].start!==void 0||w[f].count!==void 0)&&(L+=":"+w[f].start+":"+w[f].count),t.attributes.has(L)?b.indices=t.attributes.get(L):(b.indices=this.processAccessor(o.index,o,w[f].start,w[f].count),t.attributes.set(L,b.indices)),b.indices===null&&delete b.indices}const T=await this.processMaterialAsync(E[w[f].materialIndex]);T!==null&&(b.material=T),u.push(b)}x===!0&&o.setIndex(null),l.primitives=u,i.meshes||(i.meshes=[]),await this._invokeAllAsync(function(f){f.writeMesh&&f.writeMesh(e,l)});const v=i.meshes.push(l)-1;return t.meshes.set(n,v),v}detectMeshQuantization(e,t){if(this.extensionsUsed[it])return;let i;switch(t.array.constructor){case Int8Array:i="byte";break;case Uint8Array:i="unsigned byte";break;case Int16Array:i="short";break;case Uint16Array:i="unsigned short";break;default:return}t.normalized&&(i+=" normalized");const s=e.split("_",1)[0];_t[s]&&_t[s].includes(i)&&(this.extensionsUsed[it]=!0,this.extensionsRequired[it]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const i=e.isOrthographicCamera,s={type:i?"orthographic":"perspective"};return i?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:ye.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){const i=this.json,s=this.nodeMap;i.animations||(i.animations=[]),e=ht.Utils.mergeMorphTargetTracks(e.clone(),t);const n=e.tracks,o=[],r=[];for(let c=0;c<n.length;++c){const u=n[c],h=Oe.parseTrackName(u.name);let p=Oe.findNode(t,h.nodeName);const d=wt[h.propertyName];if(h.objectName==="bones"&&(p.isSkinnedMesh===!0?p=p.skeleton.getBoneByName(h.objectIndex):p=void 0),!p||!d){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',u.name);continue}const g=1;let m=u.values.length/u.times.length;d===wt.morphTargetInfluences&&(m/=p.morphTargetInfluences.length);let x;u.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(x="CUBICSPLINE",m/=3):u.getInterpolation()===Zt?x="STEP":x="LINEAR",r.push({input:this.processAccessor(new Q(u.times,g)),output:this.processAccessor(new Q(u.values,m)),interpolation:x}),o.push({sampler:r.length-1,target:{node:s.get(p),path:d}})}const l={name:e.name||"clip_"+i.animations.length,samplers:r,channels:o};return this.serializeUserData(e,l),i.animations.push(l),i.animations.length-1}processSkin(e){const t=this.json,i=this.nodeMap,s=t.nodes[i.get(e)],n=e.skeleton;if(n===void 0)return null;const o=e.skeleton.bones[0];if(o===void 0)return null;const r=[],l=new Float32Array(n.bones.length*16),c=new ut;for(let h=0;h<n.bones.length;++h)r.push(i.get(n.bones[h])),c.copy(n.boneInverses[h]),c.multiply(e.bindMatrix).toArray(l,h*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Q(l,16)),joints:r,skeleton:i.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){const t=this.json,i=this.options,s=this.nodeMap;t.nodes||(t.nodes=[]);const n={};if(i.trs){const r=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();xe(r,[0,0,0,1])||(n.rotation=r),xe(l,[0,0,0])||(n.translation=l),xe(c,[1,1,1])||(n.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),Ns(e.matrix)===!1&&(n.matrix=e.matrix.elements);if(e.name!==""&&(n.name=String(e.name)),this.serializeUserData(e,n),e.isMesh||e.isLine||e.isPoints){const r=await this.processMeshAsync(e);r!==null&&(n.mesh=r)}else e.isCamera&&(n.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);const o=t.nodes.push(n)-1;if(s.set(e,o),e.children.length>0){const r=[];for(let l=0,c=e.children.length;l<c;l++){const u=e.children[l];if(u.visible||i.onlyVisible===!1){const h=await this.processNodeAsync(u);h!==null&&r.push(h)}}r.length>0&&(n.children=r)}return await this._invokeAllAsync(function(r){r.writeNode&&r.writeNode(e,n)}),o}async processSceneAsync(e){const t=this.json,i=this.options;t.scenes||(t.scenes=[],t.scene=0);const s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);const n=[];for(let o=0,r=e.children.length;o<r;o++){const l=e.children[o];if(l.visible||i.onlyVisible===!1){const c=await this.processNodeAsync(l);c!==null&&n.push(c)}}n.length>0&&(s.nodes=n),this.serializeUserData(e,s)}async processObjectsAsync(e){const t=new gt;t.name="AuxScene";for(let i=0;i<e.length;i++)t.children.push(e[i]);await this.processSceneAsync(t)}async processInputAsync(e){const t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});const i=[];for(let s=0;s<e.length;s++)e[s]instanceof gt?await this.processSceneAsync(e[s]):i.push(e[s]);i.length>0&&await this.processObjectsAsync(i);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,i=this.plugins.length;t<i;t++)await e(this.plugins[t])}}class Fs{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const i=this.writer,s=i.json,n=i.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),n[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},n[this.name]=!0);const r=s.extensions[this.name].lights;r.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:r.length-1}}}class ks{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;const s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class js{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;const i=this.writer,s=i.extensionsUsed,n={};if(n.clearcoatFactor=e.clearcoat,e.clearcoatMap){const o={index:await i.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};i.applyTextureTransform(o,e.clearcoatMap),n.clearcoatTexture=o}if(n.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const o={index:await i.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};i.applyTextureTransform(o,e.clearcoatRoughnessMap),n.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){const o={index:await i.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),i.applyTextureTransform(o,e.clearcoatNormalMap),n.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Hs{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;const s=this.writer.extensionsUsed,n={};n.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Gs{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;const i=this.writer,s=i.extensionsUsed,n={};if(n.iridescenceFactor=e.iridescence,e.iridescenceMap){const o={index:await i.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};i.applyTextureTransform(o,e.iridescenceMap),n.iridescenceTexture=o}if(n.iridescenceIor=e.iridescenceIOR,n.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],n.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){const o={index:await i.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};i.applyTextureTransform(o,e.iridescenceThicknessMap),n.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Vs{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const i=this.writer,s=i.extensionsUsed,n={};if(n.transmissionFactor=e.transmission,e.transmissionMap){const o={index:await i.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};i.applyTextureTransform(o,e.transmissionMap),n.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Ys{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const i=this.writer,s=i.extensionsUsed,n={};if(n.thicknessFactor=e.thickness,e.thicknessMap){const o={index:await i.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};i.applyTextureTransform(o,e.thicknessMap),n.thicknessTexture=o}e.attenuationDistance!==1/0&&(n.attenuationDistance=e.attenuationDistance),n.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Ws{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;const s=this.writer.extensionsUsed,n={};n.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Ks{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(Ls)&&!e.specularIntensityMap&&!e.specularColorMap)return;const i=this.writer,s=i.extensionsUsed,n={};if(e.specularIntensityMap){const o={index:await i.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};i.applyTextureTransform(o,e.specularIntensityMap),n.specularTexture=o}if(e.specularColorMap){const o={index:await i.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};i.applyTextureTransform(o,e.specularColorMap),n.specularColorTexture=o}n.specularFactor=e.specularIntensity,n.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Xs{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;const i=this.writer,s=i.extensionsUsed,n={};if(e.sheenRoughnessMap){const o={index:await i.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};i.applyTextureTransform(o,e.sheenRoughnessMap),n.sheenRoughnessTexture=o}if(e.sheenColorMap){const o={index:await i.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};i.applyTextureTransform(o,e.sheenColorMap),n.sheenColorTexture=o}n.sheenRoughnessFactor=e.sheenRoughness,n.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Zs{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;const i=this.writer,s=i.extensionsUsed,n={};if(e.anisotropyMap){const o={index:await i.processTextureAsync(e.anisotropyMap)};i.applyTextureTransform(o,e.anisotropyMap),n.anisotropyTexture=o}n.anisotropyStrength=e.anisotropy,n.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class qs{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;const s=this.writer.extensionsUsed,n={};n.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Qs{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;const i=this.writer,s=i.extensionsUsed,n={};if(e.bumpMap){const o={index:await i.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};i.applyTextureTransform(o,e.bumpMap),n.bumpTexture=o}n.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=n,s[this.name]=!0}}class Js{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;const i=this.writer,s=e,n=new Float32Array(s.count*3),o=new Float32Array(s.count*4),r=new Float32Array(s.count*3),l=new ut,c=new M,u=new lt,h=new M;for(let d=0;d<s.count;d++)s.getMatrixAt(d,l),l.decompose(c,u,h),c.toArray(n,d*3),u.toArray(o,d*4),h.toArray(r,d*3);const p={TRANSLATION:i.processAccessor(new Q(n,3)),ROTATION:i.processAccessor(new Q(o,4)),SCALE:i.processAccessor(new Q(r,3))};s.instanceColor&&(p._COLOR_0=i.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:p},i.extensionsUsed[this.name]=!0,i.extensionsRequired[this.name]=!0}}ht.Utils={insertKeyframe:function(a,e){const i=a.getValueSize(),s=new a.TimeBufferType(a.times.length+1),n=new a.ValueBufferType(a.values.length+i),o=a.createInterpolant(new a.ValueBufferType(i));let r;if(a.times.length===0){s[0]=e;for(let l=0;l<i;l++)n[l]=0;r=0}else if(e<a.times[0]){if(Math.abs(a.times[0]-e)<.001)return 0;s[0]=e,s.set(a.times,1),n.set(o.evaluate(e),0),n.set(a.values,i),r=0}else if(e>a.times[a.times.length-1]){if(Math.abs(a.times[a.times.length-1]-e)<.001)return a.times.length-1;s[s.length-1]=e,s.set(a.times,0),n.set(a.values,0),n.set(o.evaluate(e),a.values.length),r=s.length-1}else for(let l=0;l<a.times.length;l++){if(Math.abs(a.times[l]-e)<.001)return l;if(a.times[l]<e&&a.times[l+1]>e){s.set(a.times.slice(0,l+1),0),s[l+1]=e,s.set(a.times.slice(l+1),l+2),n.set(a.values.slice(0,(l+1)*i),0),n.set(o.evaluate(e),(l+1)*i),n.set(a.values.slice((l+1)*i),(l+2)*i),r=l+1;break}}return a.times=s,a.values=n,r},mergeMorphTargetTracks:function(a,e){const t=[],i={},s=a.tracks;for(let n=0;n<s.length;++n){let o=s[n];const r=Oe.parseTrackName(o.name),l=Oe.findNode(e,r.nodeName);if(r.propertyName!=="morphTargetInfluences"||r.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(rs)}const c=l.morphTargetInfluences.length,u=l.morphTargetDictionary[r.propertyIndex];if(u===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+r.propertyIndex);let h;if(i[l.uuid]===void 0){h=o.clone();const d=new h.ValueBufferType(c*h.times.length);for(let g=0;g<h.times.length;g++)d[g*c+u]=h.values[g];h.name=(r.nodeName||"")+".morphTargetInfluences",h.values=d,i[l.uuid]=h,t.push(h);continue}const p=o.createInterpolant(new o.ValueBufferType(1));h=i[l.uuid];for(let d=0;d<h.times.length;d++)h.values[d*c+u]=p.evaluate(h.times[d]);for(let d=0;d<o.times.length;d++){const g=this.insertKeyframe(h,o.times[d]);h.values[g*c+u]=o.values[d]}}return a.tracks=t,a},toFloat32BufferAttribute:function(a){const e=new Q(new Float32Array(a.count*a.itemSize),a.itemSize,!1);if(!a.normalized&&!a.isInterleavedBufferAttribute)return e.array.set(a.array),e;for(let t=0,i=a.count;t<i;t++)for(let s=0;s<a.itemSize;s++)e.setComponent(t,s,a.getComponent(t,s));return e}};Ue.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new P(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Pe.line={uniforms:we.merge([Ue.common,Ue.fog,Ue.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class $s extends se{constructor(e){super({type:"LineMaterial",uniforms:we.clone(Pe.line.uniforms),vertexShader:Pe.line.vertexShader,fragmentShader:Pe.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const vt=new dt,Le=new M;class ei extends as{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Be(e,3)),this.setAttribute("uv",new Be(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new ct(t,6,1);return this.setAttribute("instanceStart",new oe(i,3,0)),this.setAttribute("instanceEnd",new oe(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new ct(t,6,1);return this.setAttribute("instanceColorStart",new oe(i,3,0)),this.setAttribute("instanceColorEnd",new oe(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new ls(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new dt);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),vt.setFromBufferAttribute(t),this.boundingBox.union(vt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Rt),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let s=0;for(let n=0,o=e.count;n<o;n++)Le.fromBufferAttribute(e,n),s=Math.max(s,i.distanceToSquared(Le)),Le.fromBufferAttribute(t,n),s=Math.max(s,i.distanceToSquared(Le));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}const ot=new be,Et=new M,Mt=new M,z=new be,O=new be,V=new be,rt=new M,at=new ut,B=new cs,At=new M,Re=new dt,Ce=new Rt,Y=new be;let W,ie;function Dt(a,e,t){return Y.set(0,0,-e,1).applyMatrix4(a.projectionMatrix),Y.multiplyScalar(1/Y.w),Y.x=ie/t.width,Y.y=ie/t.height,Y.applyMatrix4(a.projectionMatrixInverse),Y.multiplyScalar(1/Y.w),Math.abs(Math.max(Y.x,Y.y))}function ti(a,e){const t=a.matrixWorld,i=a.geometry,s=i.attributes.instanceStart,n=i.attributes.instanceEnd,o=Math.min(i.instanceCount,s.count);for(let r=0,l=o;r<l;r++){B.start.fromBufferAttribute(s,r),B.end.fromBufferAttribute(n,r),B.applyMatrix4(t);const c=new M,u=new M;W.distanceSqToSegment(B.start,B.end,u,c),u.distanceTo(c)<ie*.5&&e.push({point:u,pointOnLine:c,distance:W.origin.distanceTo(u),object:a,face:null,faceIndex:r,uv:null,uv1:null})}}function si(a,e,t){const i=e.projectionMatrix,n=a.material.resolution,o=a.matrixWorld,r=a.geometry,l=r.attributes.instanceStart,c=r.attributes.instanceEnd,u=Math.min(r.instanceCount,l.count),h=-e.near;W.at(1,V),V.w=1,V.applyMatrix4(e.matrixWorldInverse),V.applyMatrix4(i),V.multiplyScalar(1/V.w),V.x*=n.x/2,V.y*=n.y/2,V.z=0,rt.copy(V),at.multiplyMatrices(e.matrixWorldInverse,o);for(let p=0,d=u;p<d;p++){if(z.fromBufferAttribute(l,p),O.fromBufferAttribute(c,p),z.w=1,O.w=1,z.applyMatrix4(at),O.applyMatrix4(at),z.z>h&&O.z>h)continue;if(z.z>h){const v=z.z-O.z,f=(z.z-h)/v;z.lerp(O,f)}else if(O.z>h){const v=O.z-z.z,f=(O.z-h)/v;O.lerp(z,f)}z.applyMatrix4(i),O.applyMatrix4(i),z.multiplyScalar(1/z.w),O.multiplyScalar(1/O.w),z.x*=n.x/2,z.y*=n.y/2,O.x*=n.x/2,O.y*=n.y/2,B.start.copy(z),B.start.z=0,B.end.copy(O),B.end.z=0;const m=B.closestPointToPointParameter(rt,!0);B.at(m,At);const x=ye.lerp(z.z,O.z,m),E=x>=-1&&x<=1,w=rt.distanceTo(At)<ie*.5;if(E&&w){B.start.fromBufferAttribute(l,p),B.end.fromBufferAttribute(c,p),B.start.applyMatrix4(o),B.end.applyMatrix4(o);const v=new M,f=new M;W.distanceSqToSegment(B.start,B.end,f,v),t.push({point:f,pointOnLine:v,distance:W.origin.distanceTo(f),object:a,face:null,faceIndex:p,uv:null,uv1:null})}}}class ui extends Ct{constructor(e=new ei,t=new $s({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,s=new Float32Array(2*t.count);for(let o=0,r=0,l=t.count;o<l;o++,r+=2)Et.fromBufferAttribute(t,o),Mt.fromBufferAttribute(i,o),s[r]=r===0?0:s[r-1],s[r+1]=s[r]+Et.distanceTo(Mt);const n=new ct(s,2,1);return e.setAttribute("instanceDistanceStart",new oe(n,1,0)),e.setAttribute("instanceDistanceEnd",new oe(n,1,1)),this}raycast(e,t){const i=this.material.worldUnits,s=e.camera;s===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const n=e.params.Line2!==void 0&&e.params.Line2.threshold||0;W=e.ray;const o=this.matrixWorld,r=this.geometry,l=this.material;ie=l.linewidth+n,r.boundingSphere===null&&r.computeBoundingSphere(),Ce.copy(r.boundingSphere).applyMatrix4(o);let c;if(i)c=ie*.5;else{const h=Math.max(s.near,Ce.distanceToPoint(W.origin));c=Dt(s,h,l.resolution)}if(Ce.radius+=c,W.intersectsSphere(Ce)===!1)return;r.boundingBox===null&&r.computeBoundingBox(),Re.copy(r.boundingBox).applyMatrix4(o);let u;if(i)u=ie*.5;else{const h=Math.max(s.near,Re.distanceToPoint(W.origin));u=Dt(s,h,l.resolution)}Re.expandByScalar(u),W.intersectsBox(Re)!==!1&&(i?ti(this,t):si(this,s,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ot),this.material.uniforms.resolution.value.set(ot.z,ot.w))}}const ze={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Se{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const ii=new hs(-1,1,1,-1,0,1);class ni extends us{constructor(){super(),this.setAttribute("position",new Be([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Be([0,2,0,0,2,0],2))}}const oi=new ni;class It{constructor(e){this._mesh=new Ct(oi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ii)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class ri extends Se{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof se?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=we.clone(e.uniforms),this.material=new se({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new It(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Lt extends Se{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const s=e.getContext(),n=e.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0);let o,r;this.inverse?(o=0,r=1):(o=1,r=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),n.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),n.buffers.stencil.setClear(r),n.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.color.setMask(!0),n.buffers.depth.setMask(!0),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(s.EQUAL,1,4294967295),n.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),n.buffers.stencil.setLocked(!0)}}class ai extends Se{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class di{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new P);this._width=i.width,this._height=i.height,t=new Ie(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ne}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ri(ze),this.copyPass.material.blending=ds,this.clock=new fs}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let s=0,n=this.passes.length;s<n;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){const r=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(r.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(r.EQUAL,1,4294967295)}this.swapBuffers()}Lt!==void 0&&(o instanceof Lt?i=!0:o instanceof ai&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new P);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let n=0;n<this.passes.length;n++)this.passes[n].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class fi extends Se{constructor(e,t,i=null,s=null,n=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=n,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new _e}render(e,t,i){const s=e.autoClear;e.autoClear=!1;let n,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(n=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(n),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}}const li={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new _e(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Te extends Se{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new P(e.x,e.y):new P(256,256),this.clearColor=new _e(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let n=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Ie(n,o,{type:Ne}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const h=new Ie(n,o,{type:Ne});h.texture.name="UnrealBloomPass.h"+u,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const p=new Ie(n,o,{type:Ne});p.texture.name="UnrealBloomPass.v"+u,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),n=Math.round(n/2),o=Math.round(o/2)}const r=li;this.highPassUniforms=we.clone(r.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new se({uniforms:this.highPassUniforms,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];n=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new P(1/n,1/o),n=Math.round(n/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=we.clone(ze.uniforms),this.blendMaterial=new se({uniforms:this.copyUniforms,vertexShader:ze.vertexShader,fragmentShader:ze.fragmentShader,premultipliedAlpha:!0,blending:ps,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new _e,this._oldClearAlpha=1,this._basic=new ms,this._fsQuad=new It(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let n=0;n<this.nMips;n++)this.renderTargetsHorizontal[n].setSize(i,s),this.renderTargetsVertical[n].setSize(i,s),this.separableBlurMaterials[n].uniforms.invSize.value=new P(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,n){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),n&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let r=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=r.texture,this.separableBlurMaterials[l].uniforms.direction.value=Te.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Te.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),r=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,n&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){const t=[],i=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(i*i))/i);return new se({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new P(.5,.5)},direction:{value:new P(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new se({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}Te.BlurDirectionX=new P(1,0);Te.BlurDirectionY=new P(0,1);const pi={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new P(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`};class mi{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let i,s,n;const o=.5*(Math.sqrt(3)-1),r=(e+t)*o,l=Math.floor(e+r),c=Math.floor(t+r),u=(3-Math.sqrt(3))/6,h=(l+c)*u,p=l-h,d=c-h,g=e-p,m=t-d;let x,E;g>m?(x=1,E=0):(x=0,E=1);const w=g-x+u,v=m-E+u,f=g-1+2*u,y=m-1+2*u,b=l&255,T=c&255,L=this.perm[b+this.perm[T]]%12,R=this.perm[b+x+this.perm[T+E]]%12,D=this.perm[b+1+this.perm[T+1]]%12;let S=.5-g*g-m*m;S<0?i=0:(S*=S,i=S*S*this._dot(this.grad3[L],g,m));let C=.5-w*w-v*v;C<0?s=0:(C*=C,s=C*C*this._dot(this.grad3[R],w,v));let N=.5-f*f-y*y;return N<0?n=0:(N*=N,n=N*N*this._dot(this.grad3[D],f,y)),70*(i+s+n)}noise3d(e,t,i){let s,n,o,r;const c=(e+t+i)*.3333333333333333,u=Math.floor(e+c),h=Math.floor(t+c),p=Math.floor(i+c),d=1/6,g=(u+h+p)*d,m=u-g,x=h-g,E=p-g,w=e-m,v=t-x,f=i-E;let y,b,T,L,R,D;w>=v?v>=f?(y=1,b=0,T=0,L=1,R=1,D=0):w>=f?(y=1,b=0,T=0,L=1,R=0,D=1):(y=0,b=0,T=1,L=1,R=0,D=1):v<f?(y=0,b=0,T=1,L=0,R=1,D=1):w<f?(y=0,b=1,T=0,L=0,R=1,D=1):(y=0,b=1,T=0,L=1,R=1,D=0);const S=w-y+d,C=v-b+d,N=f-T+d,G=w-L+2*d,U=v-R+2*d,J=f-D+2*d,H=w-1+3*d,ae=v-1+3*d,F=f-1+3*d,$=u&255,ee=h&255,te=p&255,ve=this.perm[$+this.perm[ee+this.perm[te]]]%12,Ee=this.perm[$+y+this.perm[ee+b+this.perm[te+T]]]%12,Me=this.perm[$+L+this.perm[ee+R+this.perm[te+D]]]%12,Ae=this.perm[$+1+this.perm[ee+1+this.perm[te+1]]]%12;let K=.6-w*w-v*v-f*f;K<0?s=0:(K*=K,s=K*K*this._dot3(this.grad3[ve],w,v,f));let X=.6-S*S-C*C-N*N;X<0?n=0:(X*=X,n=X*X*this._dot3(this.grad3[Ee],S,C,N));let Z=.6-G*G-U*U-J*J;Z<0?o=0:(Z*=Z,o=Z*Z*this._dot3(this.grad3[Me],G,U,J));let q=.6-H*H-ae*ae-F*F;return q<0?r=0:(q*=q,r=q*q*this._dot3(this.grad3[Ae],H,ae,F)),32*(s+n+o+r)}noise4d(e,t,i,s){const n=this.grad4,o=this.simplex,r=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let u,h,p,d,g;const m=(e+t+i+s)*l,x=Math.floor(e+m),E=Math.floor(t+m),w=Math.floor(i+m),v=Math.floor(s+m),f=(x+E+w+v)*c,y=x-f,b=E-f,T=w-f,L=v-f,R=e-y,D=t-b,S=i-T,C=s-L,N=R>D?32:0,G=R>S?16:0,U=D>S?8:0,J=R>C?4:0,H=D>C?2:0,ae=S>C?1:0,F=N+G+U+J+H+ae,$=o[F][0]>=3?1:0,ee=o[F][1]>=3?1:0,te=o[F][2]>=3?1:0,ve=o[F][3]>=3?1:0,Ee=o[F][0]>=2?1:0,Me=o[F][1]>=2?1:0,Ae=o[F][2]>=2?1:0,K=o[F][3]>=2?1:0,X=o[F][0]>=1?1:0,Z=o[F][1]>=1?1:0,q=o[F][2]>=1?1:0,pt=o[F][3]>=1?1:0,Fe=R-$+c,ke=D-ee+c,je=S-te+c,He=C-ve+c,Ge=R-Ee+2*c,Ve=D-Me+2*c,Ye=S-Ae+2*c,We=C-K+2*c,Ke=R-X+3*c,Xe=D-Z+3*c,Ze=S-q+3*c,qe=C-pt+3*c,Qe=R-1+4*c,Je=D-1+4*c,$e=S-1+4*c,et=C-1+4*c,le=x&255,ce=E&255,he=w&255,ue=v&255,Nt=r[le+r[ce+r[he+r[ue]]]]%32,zt=r[le+$+r[ce+ee+r[he+te+r[ue+ve]]]]%32,Ot=r[le+Ee+r[ce+Me+r[he+Ae+r[ue+K]]]]%32,Bt=r[le+X+r[ce+Z+r[he+q+r[ue+pt]]]]%32,Ft=r[le+1+r[ce+1+r[he+1+r[ue+1]]]]%32;let de=.6-R*R-D*D-S*S-C*C;de<0?u=0:(de*=de,u=de*de*this._dot4(n[Nt],R,D,S,C));let fe=.6-Fe*Fe-ke*ke-je*je-He*He;fe<0?h=0:(fe*=fe,h=fe*fe*this._dot4(n[zt],Fe,ke,je,He));let pe=.6-Ge*Ge-Ve*Ve-Ye*Ye-We*We;pe<0?p=0:(pe*=pe,p=pe*pe*this._dot4(n[Ot],Ge,Ve,Ye,We));let me=.6-Ke*Ke-Xe*Xe-Ze*Ze-qe*qe;me<0?d=0:(me*=me,d=me*me*this._dot4(n[Bt],Ke,Xe,Ze,qe));let ge=.6-Qe*Qe-Je*Je-$e*$e-et*et;return ge<0?g=0:(ge*=ge,g=ge*ge*this._dot4(n[Ft],Qe,Je,$e,et)),27*(u+h+p+d+g)}_dot(e,t,i){return e[0]*t+e[1]*i}_dot3(e,t,i,s){return e[0]*t+e[1]*i+e[2]*s}_dot4(e,t,i,s,n){return e[0]*t+e[1]*i+e[2]*s+e[3]*n}}export{di as E,pi as F,ht as G,ei as L,hi as O,fi as R,mi as S,Te as U,$s as a,ui as b,ri as c};
