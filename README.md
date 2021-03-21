# Guitar Hero: Back in Black!

## Team:
	Hunter Dermott - 9999999
	Mat Ruiz - 205400681
	Rodrigo Gonzalez - 905161154

## Welcome to Guitar Hero: Back in Black!

This is a rhythm based game where the objective is to rock on! Based on the popular music guitar based rhythm game, Guitar Hero, the objective is to land as many notes as you can to the colored fret notes on the guitar neck. Using the 'A' key for green, 'S' key for red, 'D' key for yellow, and 'F' key for blue, be sure to not miss to many notes, or your "ROCK" meter will reach the danger zone and you will lose the game! Keep the crowd happy and the "ROCK" meter up, and you will rock out to ACDC's classic song, Back in Black!

The start screen displays the start button and quick controls, where after pressing the start button the song will start playing and a guitar neck will be displayed. By initializing four note "lanes" and a note velocity, we create an array of Note tuples that contain time and lane information. The update_state(dt) function taken from the collisions-demo.js example, starts to send notes down the lane for the player to match to the note buttons on screen. Using collision detection, we calculate a score and move the "ROCK" meter up or down based on missed/hit notes.


## Advanced Features:

Collision Detection

## References:

collisions_demo.js

