# Waiting in Line

## Overview
The "Waiting in Line" feature replaces how our customers interact with a pass-limited room. Rooms can be set to only allow
a certain number of active passes into the room and if the room limit was reached, a student had to create a Pass Request to be approved
by a teacher. 

Now, students can make a pass into a filled room but will be places in a "line" or "queue". When a pass is ended from a filled room, the 
student next in line will have a window of time to start their pass. Passes that are created into a filled room will be added to the line.

School Admins still have the option of disabling this feature if the previous method of creating pass requests into filled rooms
is preferred. Waiting in Line Passes affect mainly student and teacher flows for SmartPass. This would only apply if Waiting in Line is enabled
for that school.

## User Flows

### Students

A pass created by a student into a filled room is placed into a Line with their position as 1. When an active pass
in the room has been ended (either by the student or teacher), the student who's next in line goes into an intermediate state lasting
30 seconds. Since this requires the student's full attention, the pass becomes full-screen. At this point, one of three things can happen:

- The student can accept the pass, in which case the pass is started immediately
- The timer expires and the student is given a second chance to accept. After this second chance expires,
the pass is deleted
- The student can delete their current WaitingInLine pass. Creating a new pass will put them at the back of the line.

All the above points still apply if the pass was created into a restricted room. The only difference being that the
student is placed in line after their pass request is accepted.


### Teachers

A teacher sees all the Waiting In Line Passes that they issued (similar to hall passes), sorted by line position. A teacher also has
the ability to immediately start a pass, regardless of line position. Since this is an override of the default behaviour, a confirmation
dialog will ask the teacher if they are sure they want to do this.

Similar to regular Hall Passes, a teacher can also delete Waiting In Line Passes for students.

### Kiosk Mode

Kiosk Mode is similar to the student's flow with the only difference being the Waiting In Line Passes shown are only for the origin room.

## UI Considerations

- All timers are managed by the back-end. <u>**Do not use a timer on the front-end to determine when a Waiting In Line pass needs to be
removed or deleted.**</u>
- "Next in Line" means that the student is at the front of the line but their destination room is still filled. This is represented
as the line_position being 1.
- A pass is "Ready to Start" when the pass was previously  "Next in Line" and the destination room now has space to
accommodate a new pass.
- Waiting in Line Passes only go into full-screen mode when they are "Ready to Start". This puts all the user's focus on the pass and only
happens for Students and Kiosk.
