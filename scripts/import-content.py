"""Convert the supplied editorial brief to local, structured reading content.
Technical instructions are excluded; this is a content import, not execution.
"""
import re,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
s=pathlib.Path('/Users/guan/Downloads/长征网站规划方案.md').read_text()
vols=re.split(r'^## 第[一二三四五六七八]卷：',s,flags=re.M)
def clean(t):
    t=re.sub(r'^> \*\*设计说明\*\*.*$', '', t, flags=re.M)
    t=re.sub(r'^.*(?:前端展示形式|在网站中，我们将|网站在此模块设置|在网站中，可配置).*$','',t,flags=re.M)
    t=re.sub(r'（可直接做成.*?）','',t)
    t=re.sub(r'^---\s*$','',t,flags=re.M)
    return t.strip()
def chapters(v):
    parts=re.split(r'^### (.+)$',v,flags=re.M)
    return [{'title':parts[i], 'text':clean(parts[i+1])} for i in range(1,len(parts),2)]
stations=[]
parts=re.split(r'^#### 第(\d+)站：([^\n]+)\n',vols[3],flags=re.M)
for i in range(1,len(parts),3):
    body=re.split(r'^### ',parts[i+2],flags=re.M)[0]
    sections=re.split(r'^\* \*\*【([^】]+)】\*\*：\s*',body,flags=re.M)
    blocks=[{'title':sections[j],'text':clean(sections[j+1])} for j in range(1,len(sections),2)]
    stats=next((b['text'] for b in blocks if '仪表盘' in b['title']),'')
    army=re.search(r'兵力\s*`([^`]+)`',stats)
    stations.append({'id':int(parts[i]),'title':parts[i+1],'troops':army.group(1) if army else '统计口径不一', 'sections':[b for b in blocks if not any(k in b['title'] for k in ['网站','交互','仪表盘','地理坐标'])]})
stories=[]
parts=re.split(r'^#### (?:故事|细节)(\d+)：【([^】]+)】([^\n]*)\n',vols[5],flags=re.M)
for i in range(1,len(parts),4):
    body=re.split(r'^### ',parts[i+3],flags=re.M)[0]
    obj=re.search(r'\* \*\*对应(?:文物|趣味)图标\*\*：([^\n]+)',body)
    body=re.sub(r'\* \*\*对应(?:文物|趣味)图标\*\*：[^\n]+','',body)
    body=re.sub(r'\* \*\*(?:故事正文|史料解密)\*\*：\s*','',body)
    stories.append({'id':len(stories)+1,'title':parts[i+1],'subtitle':parts[i+2],'object':obj.group(1),'text':clean(body)})
# Keep the complete reading material while making the editorial provenance explicit.
# Correct clear internal contradictions rather than turning them into quiz answers.
corrections={
 '整整5万多名十几岁、二十几岁的年轻生命，永远留在了桂北的青山绿水间。':'这一减员数字包括战斗伤亡、失散等多种情况，不能直接等同于阵亡人数。',
 '他们是瑞士籍英国传教士**薄复礼（Rudolf Alfred Bosshardt）**和精通多国语言的传教士**勃沙特**。':'其中一位是瑞士籍传教士**薄复礼（Rudolf Alfred Bosshardt）**；“勃沙特”是同一人的音译，不是另一位传教士。',
 '一跳一跳地走完了剩下的万水千山':'在担架、骑马与拄拐等帮助下走过了剩下的万水千山',
 '第一次独立自主地运用马克思主义基本原理解决自己的路线、方针和政策问题':'独立自主地运用马克思主义基本原理解决自己的路线、方针和政策问题',
 '1935年8月穿越松潘大草地时，红四方面军14岁小战士周广才':'1936年红四方面军过草地时，小战士周广才',
 '杀菌活血':'当时缺医少药条件下的民间尝试，不能当作现代治疗方法',
}
data={'prologue':chapters(vols[2]),'stations':stations,'stories':stories,'armies':clean(vols[4].split('\n',1)[1]),'meaning':chapters(vols[6]),'poems':[],'songs':clean(vols[7].split('### 第二章：')[1].split('\n',1)[1]),'quiz':[]}
p=re.split(r'^#### \d+\. 《([^》]+)》([^\n]*)\n',vols[7].split('### 第二章：')[0],flags=re.M)
for i in range(1,len(p),3): data['poems'].append({'title':p[i],'context':p[i+1],'text':clean(p[i+2])})
qs=vols[8].split('### 第二章：')[0]
p=re.split(r'^\d+\. \*\*【([^】]+)】\*\*\s*',qs,flags=re.M)
stationIds=[1,3,5,7,10,11,13,14,15,16,18,19,20,21,22]
for i in range(1,len(p),2):
    body=p[i+1]; question=body.split('\n')[0].strip(); options=re.findall(r'^\s*\* [ABC]\. (.+)',body,flags=re.M)
    answer=next(j for j,o in enumerate(options) if '（正确）' in o)
    options=[o.replace('**','').replace('（正确）','') for o in options]
    data['quiz'].append({'question':question,'options':options,'answer':answer,'explanation':'历史回看：'+options[answer]+'。请结合相关站点的历史全景与人物细节，理解答案所处的情境。','station':stationIds[len(data['quiz'])]})
encoded=json.dumps(data,ensure_ascii=False,indent=2)
for a,b in corrections.items():encoded=encoded.replace(a,b)
(root/'src/content.json').write_text(encoded)
(root/'src/quiz-content.ts').write_text('export default '+json.dumps(json.loads(encoded)['quiz'],ensure_ascii=False,indent=2)+';\n')
(root/'docs/content-coverage.md').write_text('# 内容补全对照\n\n来源：用户提供的《长征网站规划方案.md》。技术指令不进入读者正文。\n\n'+ '\n'.join(f'- 第{x["id"]}站：{x["title"]} — {len(x["sections"])}个阅读分节' for x in stations)+'\n\n'+ '\n'.join(f'- 故事{x["id"]}：{x["title"]} — 独立生成物件图片 object-{x["id"]:02d}.webp' for x in stories)+'\n\n序幕两章、四军完整对照表、历史意义两章、5组诗词赏析（三首小令合并）、战地歌谣、原方案15道情境题均接入。\n\n编辑说明：方案为内容底稿，不等同于逐字史料。文学故事和拟写对白明确标注为叙事；减员≠全部阵亡；薄复礼/勃沙特同人；钟赤兵行程包含战友照护；辣椒不能替代保暖和医疗。\n')
print({k:len(v) for k,v in data.items()});print('Reading characters',len(encoded))
