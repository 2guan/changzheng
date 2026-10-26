import json, math
from pathlib import Path
out=Path(__file__).parent
# Three contrasting movements, each 48 bars. Original themes, no quoted melodies.
settings=[('departure','山河长路 · 一、星火启程',88,'D minor',0),('snow','山河长路 · 二、雪岭相扶',72,'D minor / F major',1),('reunion','山河长路 · 三、万里同归',96,'D major',2)]
inst=[('v1','第一小提琴','strings',.50,-.3,'sustain'),('v2','第二小提琴','strings',.28,-.12,'sustain'),('vc','大提琴','cello-section',.28,.22,'sustain'),('bass','低音提琴','bass',.55,.1,None),('horn','圆号','french-horn',.37,.28,'sustain'),('flute','长笛','flute',.54,-.18,'sustain'),('oboe','双簧管','oboe',.75,.12,'vibrato'),('harp','竖琴','harp',.22,-.45,'pluck'),('trumpet','小号','trumpet',.25,.4,'sustain'),('timpani','定音鼓','timpani',.30,.05,'hit'),('snare','小军鼓','snare',.65,.18,None),('gong','锣','gong',.32,.1,'hit')]
# Each eight-bar theme has a question, an ascent, a contrasting answer and a cadence.
themeA=[[(62,1),(65,.5),(69,1),(67,.5),(65,1)],[(65,1.5),(62,.5),(70,1),(69,1)],[(69,1),(72,.5),(74,.5),(72,1),(69,1)],[(67,.5),(64,.5),(67,1),(72,1.5)],[(67,1.5),(70,.5),(69,.5),(67,.5),(65,1)],[(65,.5),(64,.5),(62,2),(69,.5)],[(64,1),(67,1),(70,.5),(67,.5),(64,1)],[(73,1),(71,.5),(69,.5),(73,1),(69,1)]]
themeB=[[(69,2),(67,.5),(65,.5),(62,1)],[(70,1),(74,1.5),(72,.5),(70,1)],[(72,1.5),(69,.5),(65,2)],[(67,1),(64,1),(60,1.5)],[(62,.5),(65,.5),(67,2),(70,.5)],[(69,1.5),(65,.5),(64,.5),(62,1.5)],[(67,.5),(70,.5),(76,1.5),(74,.5),(70,1)],[(73,1.5),(69,.5),(64,1),(61,1)]]
themeC=[[(74,1.5),(69,.5),(66,1),(69,1)],[(71,1),(74,.5),(78,.5),(76,1),(74,1)],[(73,1),(76,1.5),(74,.5),(73,1)],[(71,1.5),(67,.5),(66,.5),(64,.5),(62,1)],[(67,1),(71,.5),(74,.5),(76,1),(74,1)],[(69,.5),(66,.5),(62,1.5),(64,.5),(66,1)],[(64,1),(67,1),(71,1),(76,.5)],[(73,.5),(71,.5),(69,1),(73,1),(69,1)]]
themeD=[[(65,1.5),(69,.5),(74,1.5)],[(74,1),(70,.5),(65,.5),(62,1.5)],[(77,2),(76,.5),(72,.5),(69,1)],[(76,1.5),(72,.5),(67,1.5)],[(74,.5),(70,.5),(67,2),(65,.5)],[(69,1),(65,1.5),(62,1)],[(70,1.5),(67,.5),(64,1),(62,.5)],[(61,1),(64,.5),(69,1),(73,.5),(69,1)]]
themeE=[[(66,.5),(69,.5),(74,2),(76,.5)],[(78,1.5),(74,.5),(71,1.5)],[(76,1),(73,.5),(69,.5),(66,2)],[(74,1.5),(71,.5),(67,1),(69,.5)],[(71,.5),(74,.5),(79,1.5),(78,.5),(74,1)],[(78,1),(76,.5),(74,.5),(69,1.5)],[(76,1),(71,1),(67,.5),(64,1)],[(69,.5),(73,.5),(76,1.5),(73,.5),(69,1)]]
minor=[[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,64],[43,50,55,58],[50,57,62,65],[52,58,64,67],[45,52,57,61]]
major=[[50,57,62,66],[47,54,59,62],[54,61,66,69],[43,50,55,59],[55,62,67,71],[50,57,62,66],[52,59,64,67],[45,52,57,61]]
for slug,title,bpm,key,mov in settings:
 tracks={id:dict(id=id,name=name,instrumentId=instrument,color='#9E543B',volume=vol,pan=pan,muted=False,solo=False,notes=[],release=.3,reverb=.30 if id not in ['bass','snare','timpani'] else .13,humanize=.18,**({'articulation':art} if art else {})) for id,name,instrument,vol,pan,art in inst}
 def n(id,start,pitch,dur,vel=.6,art=None):
  if start<0 or start>=192:return
  note=dict(id=f'{slug}-{id}-{len(tracks[id]["notes"])}',midi=int(pitch),start=round(start,4),duration=round(min(dur,192-start),4),velocity=round(max(.12,min(.88,vel)),3))
  if art:note['articulation']=art
  tracks[id]['notes'].append(note)
 for bar in range(48):
  sec=bar//8; b=bar%8;t=bar*4
  phrase = ([4,5,0,2,1,6,7,7][b] if sec==3 else b)
  chord=(major if mov==2 else minor)[phrase]
  energy=([.40,.61,.66,.73,.78,.49] if mov==0 else [.36,.48,.56,.63,.56,.39] if mov==1 else [.52,.64,.72,.79,.83,.59])[sec]
  if sec==5 and b>3:energy*=1-(b-3)*.10
  # Grounded bass line; changes rhythm at cadences rather than looping one ostinato.
  root=chord[0] if chord[0]<49 else chord[0]-12
  n('bass',t,root,3.7 if mov==1 else 1.7,energy*.8)
  if mov!=1:n('bass',t+2,root+7 if b%2==0 else root,1.65,energy*.67)
  if mov==1 or sec in [0,5]:
   n('vc',t,chord[0],3.8,energy*.65)
  else:
   for j,p in enumerate([chord[0],chord[1],chord[2],chord[1]]):n('vc',t+j,p,.82,energy*(.9 if j==0 else .7),'spiccato')
  # Sustained inner strings with open spacing, voiced for chord continuity.
  n('v2',t+.03,chord[2],3.85,energy*.62)
  if sec in [0,3,4]:n('v2',t+.05,chord[3],3.8,energy*.48)
  # Harp changes register and density by movement/section.
  pattern=[0,1,2,3,2,1] if mov==1 else [0,2,1,3]
  for j,index in enumerate(pattern):
   start=t+j*(.5 if mov==1 else 1)
   n('harp',start,chord[index]+12,1.4,energy*(.42+.07*(j%3)))
  theme=(themeC if mov==2 else themeB if mov==1 or sec==3 else themeA)
  if mov==1 and sec in [2,3,4]:theme=themeD
  if mov==2 and sec in [2,3]:theme=themeE
  notes=theme[phrase]
  # Intro is a quiet horn statement; middle develops through woodwind dialogues.
  lead= ('horn' if sec==0 else 'v1' if sec in [1,4,5] else 'oboe' if sec==2 else 'flute')
  if mov==1:lead=['oboe','vc','flute','v1','horn','oboe'][sec]
  if mov==2:lead=['horn','v1','flute','trumpet','v1','horn'][sec]
  offset=.5 if sec in [0,2] else 0
  total=sum(d for _,d in notes); scale=(4-offset)/total if total>4-offset else 1
  for k,(pitch,dur) in enumerate(notes):
   pitch=pitch-12 if lead in ['horn','vc'] else pitch
   if sec==4 and lead=='v1':pitch+=0 if mov==2 else 12
   duration=dur*scale
   # Short connective notes remain connected; no random pitch generator.
   n(lead,t+offset,pitch,max(.08,duration-.06),(.70+.15*energy) if lead=='oboe' else energy*(.90+.10*math.sin(k+1)))
   if sec==4 and mov==2:n('trumpet',t+offset,pitch-12,max(.08,duration-.1),energy*.48)
   offset+=duration
  # Independent counter-melody: delayed, sparse and with room for the main phrase.
  if sec in [1,3,4] and b%2==1 and lead!='flute':
   for j,p in enumerate([chord[3]+12,chord[2]+12,chord[1]+12]):n('flute',t+.5+j,p,.75,energy*.57)
  if lead!='horn' and sec in [1,3,4]:
   n('horn',t+.1,chord[1],2.7,energy*.48)
   n('horn',t+.13,chord[3],2.7,energy*.36)
  if lead!='v1' and sec not in [0,5]:
   n('v1',t,chord[3]+12,3.7,energy*.45,'tremolo' if mov==1 and sec==3 else 'sustain')
  # Percussion is reserved for structural accents, leaving the reflective movement spacious.
  if mov!=1 and sec in [1,3,4]:
   n('timpani',t,50,.6,energy*.70)
   if b in [3,7]: n('timpani',t+3,45,.6,energy*.5)
   for beat in ([1,3] if sec!=4 else [1,2.5,3,3.5]):n('snare',t+beat,60,.15,.55+energy*.12)
  if b==0 and sec in [3,4]:n('gong',t,60,3,.65 if mov!=1 else .45)
 # Last two bars resolve differently: quiet minor ending, suspended winter, broad major arrival.
 for tr in tracks.values():tr['notes']=[q for q in tr['notes'] if q['start']<184]
 final=[50,57,62,66 if mov==2 else 65]
 for id,p in [('vc',50),('bass',38),('v1',74),('v2',final[3]),('horn',57)]:
  n(id,184,p,7.5,.48 if mov==2 else .35)
 for j,p in enumerate(final+[69,74]):n('harp',184+j*.5,p,3,.45)
 if mov==2:n('gong',184,60,4,.6)
 # Calibrate the quieter oboe bank without altering the shared sample library.
 for tr in tracks.values():
  if tr['id']!='oboe':tr['volume']=round(tr['volume']*.4,4)
 p=dict(schemaVersion=1,id=f'changzheng-shanhe-{slug}-20261025',title=title,bpm=bpm,key=key,bars=48,timeSignature=[4,4],updatedAt='2026-10-25T08:00:00.000Z',tracks=[t for t in tracks.values() if t['notes']])
 (out/f'{slug}.json').write_text(json.dumps({'project':p},ensure_ascii=False,indent=2))
 print(slug,round(48*4*60/bpm,1),'seconds',sum(len(t['notes']) for t in p['tracks']),'notes')
