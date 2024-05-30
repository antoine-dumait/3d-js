# 3D-JS

! DEMO AVAILABLE HERE : https://antoine-dumait.github.io/3d-js/ !

3D-JS is an attempt to write a software renderer in JS and using it to build a Minecraft like "game" (more a demo as of right now).
3D-JS is written completely in vanilla JS (changed to TypeScript recently), meaning no 3D libraries like Three.js or Babylon.js, nor harware acceleration (only uses the CPU).
Mathematical implementations of 2D or 3D vectors and matrix are also self made and  written directly in JS.
It only uses the context of the canvas available in JS, trying to overcome it's poor performances.

Currently it's able to :

 - Render any .obj, but only vertices and triangles, no materials.
 - Render block type objects.
 - Uses perspective corrected texture mapping
 - Implements a camera with 5 degrees of freedom (no roll).
 - Directional lighting (deactivated in Minecraft like demo).

Optimizations in the render pipeline :

 - Back-face culling
 - Near plane clipping
 - All 4 screen planes clipping
 - Doesn't use Canvas function to draw pixels, directly dump 8 bit array to canvas context
 - In Minecraft demo, draws only visible faces.

TO DO LIST :

 - [ ] Add physic based movement, make sand fall
 - [ ] Separate engine from Minecraft demo implementations.
 - [x] Draw only visible faces
 - [x] Fix inversed coordinate system
 - [ ] Add back diffuse and ambient lighting
 - [ ] Add multiplayer ?
 - [ ] Performance improvement 
 - [ ] Change language ?
 - [x] Create block load file system
 - [x] More than one texture per block
 - [x] Right click to delete
 - [ ] Load texture asynchronously
 - [ ] Add full screen
 
Technical information
Left handed cartesian coordinates system
Clock wise triangle, normal calculated based on this

Vertex order:
 
	  1 2
	1 0 3 2
	5 4 7 6
	  5 6

Face order (two triangle by face):

	   1
	 2 5 4
	   3
	   6
