/* Load the per-question materials independently of the audio-rich HTML. */
if (Array.isArray(window.G) && !window.IELTSQuestionMaterialsScript) {
  window.IELTSQuestionMaterialsScript = true;
  var materialLink = document.createElement('a');
  materialLink.href = 'materials.html';
  materialLink.textContent = '逐题扣题素材 · Part 2 / Part 3';
  materialLink.style.cssText = 'display:block;margin:10px 0;color:#795d96;font-size:13px';
  var materialHeading = document.querySelector('h1');
  if (materialHeading) materialHeading.insertAdjacentElement('afterend', materialLink);
  var questionMaterialScript = document.createElement('script');
  questionMaterialScript.src = 'question-materials.js?v=20261009b';
  questionMaterialScript.onerror = function () {
    var message = document.createElement('p');
    message.setAttribute('role', 'status');
    message.textContent = '逐题素材暂时未能加载，请刷新重试。';
    document.getElementById('list').prepend(message);
  };
  document.head.appendChild(questionMaterialScript);
}
/* Authored speaking chunks for learners around B1; examples are adaptable, not model answers. */
(function initialiseVocabulary() {
  'use strict';
  // Load the small extension file before replacing the vocabulary UI.
  // The existing homepage can keep its audio-rich question bank unchanged.
  if (!window.IELTSVocabularyLevels) {
    var levelScript = document.createElement('script');
    levelScript.src = 'vocabulary-levels.js?v=20261008b';
    levelScript.onload = function () { if (window.IELTSVocabularyLevels) initialiseVocabulary(); };
    levelScript.onerror = function () {
      var notice = document.createElement('p');
      notice.setAttribute('role', 'status');
      notice.textContent = '扩展词库暂时未能加载，请刷新页面后重试。';
      document.getElementById('list').prepend(notice);
    };
    document.head.appendChild(levelScript);
    return;
  }
  var banks = {};
  var source = `
@Feeling bored
get bored easily|容易觉得无聊|I get bored easily when I have nothing to do.
do the same thing every day|每天做同样的事|Doing the same thing every day can be boring.
find something fun to do|找点有趣的事做|I usually find something fun to do, like drawing.
keep myself busy|让自己有事做|I keep myself busy by learning new recipes.
@Names
remember someone's name|记住某人的名字|I find it hard to remember someone's name after one meeting.
be named after someone|以某人的名字命名|I was named after my grandmother.
have a common name|有一个常见的名字|I have a common name, so people remember it easily.
write it down|把它记下来|I write it down so I do not forget it.
@Friends
keep in touch|保持联系|We keep in touch by sending messages.
have a lot in common|有很多共同点|We have a lot in common, especially our taste in music.
be there for someone|在某人需要时支持他|A good friend is there for you when you need help.
spend time together|一起相处|We spend time together at the weekend.
@Advertisements
catch my attention|吸引我的注意|Funny adverts usually catch my attention.
make me want to buy something|让我想买东西|A good advert can make me want to buy something.
skip an advert|跳过广告|I often skip an advert when I am watching a video.
show how a product works|展示产品如何使用|Useful adverts show how a product works.
@Shoes
feel comfortable|穿着感觉舒适|These shoes feel comfortable even after a long walk.
try them on|试穿它们|I always try them on before buying them.
go well with my clothes|和我的衣服很搭|White shoes go well with most of my clothes.
wear out quickly|很快穿坏|Cheap shoes sometimes wear out quickly.
@Emails
check my emails|查看邮件|I check my emails every morning.
reply to an email|回复邮件|I usually reply to an email within a day.
send an attachment|发送附件|I send an attachment when I share my homework.
use a more formal style|用比较正式的语气|I use a more formal style when I email my teacher.
@Street markets
buy fresh produce|买新鲜农产品|I go to street markets to buy fresh produce.
look around the stalls|逛逛摊位|I enjoy looking around the stalls with my family.
compare prices|比较价格|I compare prices before I buy anything.
get a good deal|买得划算|You can often get a good deal at a street market.
@Lost and found
leave something behind|把东西落下|I sometimes leave my umbrella behind on the bus.
look for a lost item|寻找丢失的物品|I went back to look for my lost bag.
hand it in|把拾到的东西交上去|If I find a wallet, I hand it in at the police station.
contact the owner|联系失主|I would try to contact the owner first.
@Collecting things
collect things as a hobby|把收藏当作爱好|I collect postcards as a hobby.
keep something from childhood|保留小时候的东西|I still keep some toys from childhood.
bring back memories|勾起回忆|My old photos bring back happy memories.
take up space|占地方|My collection takes up a lot of space in my room.
@Computers
use it for work and study|用它工作和学习|I use my computer for work and study.
search for information|查找信息|I search for information online when I do homework.
save my work|保存我的文件或成果|I save my work regularly in case the computer stops working.
have trouble with my computer|电脑使用遇到问题|I sometimes have trouble with my computer during online lessons.
@Growing vegetables
grow my own vegetables|自己种蔬菜|I would like to grow my own vegetables on my balcony.
water the plants regularly|定期给植物浇水|You need to water the plants regularly.
learn where food comes from|了解食物从哪里来|Growing vegetables helps children learn where food comes from.
need time and patience|需要时间和耐心|Growing tomatoes needs time and patience.
@Politeness
say please and thank you|说请和谢谢|My parents taught me to say please and thank you.
show respect for others|尊重他人|Being polite is a way to show respect for others.
hold the door open|扶着门让别人通过|I hold the door open for people behind me.
wait for my turn|等轮到自己|I always wait for my turn instead of pushing in.
@Rubbish
put rubbish in a bin|把垃圾放进垃圾桶|I always put rubbish in a bin.
pick up litter|捡起乱扔的垃圾|We sometimes pick up litter in our neighbourhood.
sort household waste|分类生活垃圾|My family sorts household waste at home.
keep the streets clean|保持街道整洁|Everyone should help keep the streets clean.
@Tiredness
feel worn out|觉得筋疲力尽|I feel worn out after a busy day at work.
get enough sleep|获得足够睡眠|I feel better when I get enough sleep.
take a short break|休息一小会儿|I take a short break when I cannot focus.
have too much to do|有太多事情要做|I get tired when I have too much to do.
@Travelling
sit by the window|坐在窗边|I prefer to sit by the window and enjoy the view.
go on a long journey|进行长途旅行|I went on a long journey with my family last summer.
travel at my own pace|按自己的节奏旅行|I like travelling alone because I can travel at my own pace.
explore a new place|探索一个新地方|I enjoy exploring a new place on foot.
@Papers
make things out of paper|用纸做东西|I used to make small animals out of paper.
write by hand|手写|I prefer to write by hand when I take quick notes.
keep a handwritten letter|保留手写信|I keep handwritten letters from my old friends.
carry a notebook with me|随身带笔记本|I carry a notebook with me to write down ideas.
@Secondary schools
settle into a new school|适应新学校|It took me a few weeks to settle into my new school.
get on well with my classmates|和同学相处融洽|I got on well with most of my classmates.
find a subject difficult|觉得一门课难|I found physics difficult because there were many formulas.
miss my school days|怀念上学的日子|I sometimes miss my school days and my old friends.
@Study
be interested in my subject|对自己的学科感兴趣|I am interested in my subject because it is useful.
keep up with my studies|跟上学习进度|I make a weekly plan to keep up with my studies.
learn by doing|通过实践学习|I learn better by doing practical tasks.
prepare for an exam|备考|I usually prepare for an exam with my classmates.
@Work
work as a teacher|担任教师（可替换职业）|I work as a teacher at a language school.
get along with my colleagues|和同事相处融洽|I get along with my colleagues and we help each other.
have a busy schedule|日程很忙|I have a busy schedule during the week.
learn useful skills|学到有用的技能|My job helps me learn useful skills every day.
@Hometown
grow up in a small town|在小镇长大（可替换地点）|I grew up in a small town near the coast.
be known for something|以某事物闻名|My hometown is known for its local food.
change a lot over the years|这些年来变化很大|My hometown has changed a lot over the years.
feel at home|感觉自在、有家的感觉|I always feel at home when I go back.
@The area you live in
live in a quiet neighbourhood|住在安静的街区|I live in a quiet neighbourhood near a park.
be close to shops|离商店近|My flat is close to shops and restaurants.
have good transport links|交通方便|The area has good transport links to the city centre.
get to know my neighbours|认识邻居|I got to know my neighbours when I moved in.
@Accommodation
share a flat with someone|和别人合租公寓|I share a flat with two friends.
have enough space|有足够的空间|My room has enough space for a desk and a bed.
let in plenty of light|采光好|The large windows let in plenty of light.
feel cosy|感觉温馨舒适|My bedroom feels cosy in the evening.
@History
learn about the past|了解过去|History helps us learn about the past.
visit a historical site|参观历史遗址|I like visiting historical sites when I travel.
understand how people lived|了解人们过去如何生活|Museums help me understand how people lived.
learn from past mistakes|从过去的错误中学习|We can learn from past mistakes by studying history.
@Headphones
listen without disturbing others|听音频而不打扰别人|Headphones let me listen without disturbing others.
block out background noise|隔绝背景噪音|My headphones block out background noise on the train.
turn the volume down|调低音量|I turn the volume down to protect my hearing.
wear wireless headphones|戴无线耳机|I wear wireless headphones when I exercise.
@Mirrors
check my appearance|检查自己的仪容|I check my appearance before I leave home.
look in the mirror|照镜子|I look in the mirror when I brush my hair.
make a room look bigger|让房间显得更大|A large mirror can make a room look bigger.
hang a mirror on the wall|把镜子挂在墙上|We hung a mirror on the wall near the door.
@Websites
visit a website regularly|经常访问一个网站|I visit this website regularly to read the news.
be easy to use|容易使用|I prefer websites that are easy to use.
find useful information|找到有用的信息|I can find useful information on educational websites.
load quickly|加载快|A good website should load quickly on my phone.
@Evening time
wind down after work|下班后放松下来|I listen to music to wind down after work.
spend a quiet evening at home|在家安静地度过晚上|I often spend a quiet evening at home.
stay up late|熬夜|I try not to stay up late on weekdays.
make time for my family|腾出时间陪家人|I make time for my family in the evening.
@Old buildings
have a long history|历史悠久|This building has a long history.
be part of local history|是当地历史的一部分|Old buildings are part of local history.
keep the original style|保留原来的风格|We should keep the original style when repairing old buildings.
be worth protecting|值得保护|I think old buildings are worth protecting.
@Watches
check the time|看时间|I check the time on my watch during lessons.
wear a watch every day|每天戴手表|I wear a watch every day because it is convenient.
arrive on time|准时到达|My watch helps me arrive on time.
receive a watch as a gift|收到一块手表作为礼物|I received a watch as a birthday gift.
@Singing
sing along to a song|跟着歌曲唱|I like singing along to songs in the car.
sing out of tune|唱跑调|I often sing out of tune, but I still enjoy it.
put me in a good mood|让我心情变好|Singing puts me in a good mood.
feel shy about singing in public|不好意思当众唱歌|I feel shy about singing in public.
@Outer space and stars
look up at the stars|抬头看星星|I like looking up at the stars on clear nights.
learn about the universe|了解宇宙|Space documentaries help me learn about the universe.
visit another planet|去另一个星球|I would love to visit another planet one day.
be curious about space|对太空好奇|I have been curious about space since I was a child.
@Teachers
explain things clearly|解释得清楚|A good teacher explains things clearly.
be patient with students|对学生有耐心|My favourite teacher was patient with us.
encourage me to try|鼓励我尝试|She encouraged me to try even when I made mistakes.
give helpful feedback|提供有帮助的反馈|My teacher gives helpful feedback on my writing.
@Ambition and dreams
set a realistic goal|设定现实的目标|I try to set a realistic goal each month.
work towards my dream|为梦想努力|I am working towards my dream of becoming a teacher.
make progress step by step|一步一步进步|I make progress step by step by practising every day.
change my mind|改变想法|I changed my mind about my future career.
@Cinema
watch a film on the big screen|在大银幕看电影|I enjoy watching films on the big screen.
follow the story|看懂、跟上剧情|The story was hard to follow.
book tickets in advance|提前订票|I usually book tickets in advance.
prefer watching films at home|更喜欢在家看电影|I prefer watching films at home because it is cheaper.
@Social media
scroll through my feed|浏览动态|I scroll through my feed during short breaks.
share photos with friends|和朋友分享照片|I use social media to share photos with friends.
spend too much time online|花太多时间上网|I sometimes spend too much time online.
check whether information is true|核实信息是否真实|I check whether information is true before sharing it.
@Science
do a simple experiment|做一个简单实验|We did simple experiments in science class.
find out how things work|弄清事物如何运作|Science helps us find out how things work.
solve everyday problems|解决日常问题|Science can help us solve everyday problems.
follow scientific news|关注科学新闻|I follow scientific news about health and space.
@Public gardens and parks
go for a walk in the park|去公园散步|I go for a walk in the park after dinner.
enjoy some fresh air|呼吸新鲜空气|Parks are good places to enjoy some fresh air.
have a picnic|野餐|We sometimes have a picnic under the trees.
have more green spaces|有更多绿地|I think cities should have more green spaces.
@Cars
get stuck in traffic|堵在路上|I often get stuck in traffic on the way to work.
take public transport|乘坐公共交通|I take public transport when parking is difficult.
find a parking space|找到停车位|It is hard to find a parking space in the city centre.
be expensive to maintain|保养维护费用高|Cars can be expensive to maintain.
@Shopping
stick to a budget|按预算花钱|I try to stick to a budget when I go shopping.
shop around|货比三家|I shop around before buying something expensive.
buy things I actually need|买自己真正需要的东西|I try to buy things I actually need.
return an item|退货|I return an item if it does not fit.
@Tidiness
put things back in their place|把东西放回原处|I put things back in their place after using them.
clear up my room|收拾房间|I clear up my room at the weekend.
keep my desk tidy|保持书桌整洁|I keep my desk tidy so I can focus.
get rid of things I do not need|清理不需要的东西|I regularly get rid of things I do not need.
@Music
listen to music to relax|听音乐放松|I listen to music to relax after work.
have different tastes in music|音乐喜好不同|My friends and I have different tastes in music.
go to a live concert|去听现场音乐会|I would like to go to a live concert this year.
remind me of a happy time|让我想起快乐的时光|This song reminds me of a happy time at school.
@Clothes
wear casual clothes|穿休闲服|I usually wear casual clothes at the weekend.
dress for the occasion|根据场合穿衣|I think it is important to dress for the occasion.
choose clothes that fit well|选合身的衣服|I choose clothes that fit well rather than follow every trend.
feel confident in what I wear|对自己的穿着感到自信|I feel confident in clothes that suit me.
@Jokes
have a good sense of humour|很有幽默感|My best friend has a good sense of humour.
make people laugh|逗人笑|He enjoys telling stories that make people laugh.
tell a funny story|讲个有趣的故事|I sometimes tell a funny story to cheer up my friends.
avoid hurting someone's feelings|避免伤害别人的感受|A good joke should avoid hurting someone's feelings.
@popular
be easy to get along with|容易相处|Popular students are often easy to get along with.
help people feel included|让别人感觉被接纳|She helps new classmates feel included.
be good at sports|擅长运动|Some students become popular because they are good at sports.
get a lot of attention|受到很多关注|Famous people get a lot of attention online.
@sports
train regularly|定期训练|She trains regularly to improve her performance.
work well as a team|团队配合好|The players work well as a team.
keep going after a setback|受挫后继续努力|I admire athletes who keep going after a setback.
support my favourite team|支持我喜欢的队伍|I support my favourite team by watching their matches.
@health
build healthy habits|养成健康习惯|Small changes can help people build healthy habits.
eat a balanced diet|均衡饮食|I encouraged my friend to eat a balanced diet.
be more physically active|多活动身体|We can be more physically active by walking every day.
feel better about myself|自我感觉更好|Regular exercise helps me feel better about myself.
@older
have a lot of life experience|有丰富的人生经历|My grandfather has a lot of life experience.
learn from their advice|从他们的建议中学习|Young people can learn from older people's advice.
treat older people with respect|尊重老年人|We should treat older people with respect.
stay independent|保持独立生活|Many older people want to stay independent.
@craft
make something by hand|亲手制作东西|She enjoys making things by hand.
pay attention to small details|留意细节|You need to pay attention to small details when making a model.
feel proud of what I made|为自己做出的东西自豪|I felt proud of what I made.
learn through practice|通过练习学习|People can learn these skills through practice.
@photos
capture a special moment|记录特别的时刻|Photos help us capture special moments.
take photos of everyday life|拍日常生活的照片|My friend likes taking photos of everyday life.
keep a record of something|记录某事|Photos keep a record of how a place changes.
look back at old photos|回看旧照片|I enjoy looking back at old photos with my family.
@meeting
start a conversation|开始聊天|We started a conversation while waiting for the bus.
make a good first impression|留下好的第一印象|Being friendly helps people make a good first impression.
find something in common|找到共同点|We quickly found something in common.
remember someone clearly|清楚地记得某人|I still remember her clearly although we met only once.
@success
put a lot of effort into something|为某事付出很多努力|He put a lot of effort into learning to swim.
overcome a difficulty|克服困难|She overcame many difficulties before she succeeded.
refuse to give up|不肯放弃|I admire him because he refused to give up.
feel a sense of achievement|有成就感|Finishing a difficult task gives me a sense of achievement.
@happy
look on the bright side|往好的方面想|My friend usually looks on the bright side.
enjoy the little things|享受生活中的小事|She enjoys the little things, like a walk in the park.
cheer someone up|使某人开心起来|Talking to friends can cheer me up.
be grateful for something|为某事心怀感激|I am grateful for the support of my family.
@languages
practise speaking regularly|经常练习口语|I practise speaking regularly with a friend.
be afraid of making mistakes|害怕犯错|Some learners are afraid of making mistakes.
learn useful expressions|学习实用表达|I learn useful expressions from short videos.
communicate with people from other countries|和其他国家的人交流|Languages help us communicate with people from other countries.
@business
run a small business|经营一家小企业|My uncle runs a small business.
understand customers' needs|了解顾客需求|Successful businesses understand customers' needs.
take a risk|冒险|Starting a business often means taking a risk.
provide a good service|提供优质服务|A business should provide a good service to keep customers.
@medical
care for patients|照顾病人|Nurses care for patients every day.
work long hours|工作时间长|Doctors sometimes work long hours.
stay calm under pressure|在压力下保持冷静|Medical workers need to stay calm under pressure.
make a difference to people's lives|改善人们的生活|She chose this career to make a difference to people's lives.
@time
save time on daily tasks|在日常任务上省时间|Planning meals helps me save time on daily tasks.
plan ahead|提前计划|I plan ahead so I do not rush in the morning.
leave things until the last minute|把事情拖到最后一刻|I try not to leave things until the last minute.
spend time on what matters|把时间用在重要的事情上|A clear plan helps us spend time on what matters.
@party
invite a few close friends|邀请几个亲近的朋友|I invited a few close friends to my birthday party.
bring people together|让大家聚在一起|Parties bring people together.
celebrate a special occasion|庆祝特别的日子|We had dinner to celebrate a special occasion.
make everyone feel welcome|让每个人觉得受欢迎|A good host makes everyone feel welcome.
@decision
think it through|仔细考虑|I thought it through before making my decision.
weigh up the options|比较各个选项|It helps to weigh up the options before choosing.
ask someone for advice|向某人寻求建议|I asked my parents for advice.
change my plans|改变计划|I had to change my plans because of the weather.
@commute
travel the same route|走同一条路线|I travel the same route to work every day.
get stuck in traffic|堵在路上|I often get stuck in traffic during rush hour.
spend a long time travelling|花很长时间在路上|I spend a long time travelling to school.
make the journey more enjoyable|让旅程更愉快|Listening to music makes the journey more enjoyable.
@listening
lose interest in the conversation|对谈话失去兴趣|I lose interest when the topic is too technical.
listen politely|礼貌地倾听|I try to listen politely even if I am not interested.
change the subject|换个话题|I changed the subject when there was a pause.
ask a question to understand more|提问以了解更多|I ask a question to understand more about the topic.
@gift
save up for something|攒钱买某物|I saved up for a birthday present for my mother.
choose something useful|选实用的东西|I prefer to choose something useful as a gift.
show someone I care|表达我对某人的关心|A gift is one way to show someone I care.
be meaningful to someone|对某人有意义|A handmade gift can be meaningful to a friend.
@service
deal with a problem quickly|迅速处理问题|The assistant dealt with my problem quickly.
give clear advice|给出清楚的建议|The staff gave clear advice about the products.
make a complaint|投诉|Customers may make a complaint if the service is poor.
recommend the shop to others|向别人推荐这家店|Good service makes me recommend the shop to others.
@wasteTime
spend hours doing something|花数小时做某事|I sometimes spend hours watching short videos.
get distracted easily|容易分心|I get distracted easily when my phone is nearby.
set a time limit|设定时间限制|I set a time limit for social media.
use my time more wisely|更合理地利用时间|I want to use my time more wisely.
@interview
talk about personal experience|谈论个人经历|The athlete talked about her personal experience.
ask interesting questions|问有意思的问题|A good interviewer asks interesting questions.
learn about someone's life|了解某人的生活|Interviews help us learn about someone's life.
hear different points of view|听到不同的观点|I enjoy hearing different points of view.
@lesson
learn something new|学到新东西|I learned something new in that lesson.
explain it step by step|一步一步解释|The teacher explained it step by step.
try it for myself|自己试一试|I understood it better when I tried it for myself.
remember it for a long time|长时间记得它|I remembered the lesson for a long time.
@budgetTrip
spend very little money|花很少的钱|We spent very little money on our day out.
bring food from home|从家里带食物|We brought food from home to save money.
enjoy free activities|享受免费活动|You can enjoy free activities in many parks.
have fun without spending much|不花太多钱也能玩得开心|Friends can have fun without spending much.
@reply
take a while to reply|过一会儿才回复|It took me a while to reply because I was busy.
think about what to say|想想该说什么|I needed time to think about what to say.
avoid a misunderstanding|避免误会|A clear reply can help avoid a misunderstanding.
apologise for the delay|为耽搁致歉|I apologised for the delay when I replied.
@techProblem
have a problem with the internet|网络出问题|I had a problem with the internet during a lesson.
restart the device|重启设备|I restarted the device to see if that helped.
ask someone for technical help|找人提供技术帮助|I asked a colleague for technical help.
find a solution online|在网上找到解决方法|I found a solution online and followed the steps.
@groupWork
share the work fairly|公平分配工作|We shared the work fairly in our group.
listen to everyone's ideas|听取每个人的想法|A good team listens to everyone's ideas.
agree on a plan|商定一个计划|We agreed on a plan before starting.
help each other out|相互帮忙|Team members should help each other out.
@cake
celebrate with a special cake|用特别的蛋糕庆祝|We celebrated my birthday with a special cake.
share it with everyone|和大家分享它|I shared it with everyone at the party.
be made at home|在家制作|The cake was made at home by my sister.
remind me of a celebration|让我想起一次庆祝活动|This cake reminds me of a family celebration.
@early
set an alarm|设闹钟|I set an alarm for six in the morning.
get an early start|早点开始|Getting an early start helped us avoid traffic.
feel sleepy at first|起初觉得困|I felt sleepy at first, but a walk helped.
have more time to get ready|有更多时间准备|Getting up early gives me more time to get ready.
@film
have an interesting plot|情节有趣|I like films that have an interesting plot.
be hard to follow|难以看懂|The story was hard to follow.
find it disappointing|觉得它令人失望|I found the film disappointing because the ending was weak.
recommend it to a friend|推荐给朋友|I would recommend a good film to a friend.
@book
get into the story|投入到故事中|I got into the story after the first chapter.
imagine the characters|想象书中的人物|I enjoy imagining the characters as I read.
learn something from a book|从书中学到东西|Children can learn something from a book about animals.
be suitable for young readers|适合年轻读者|Books with simple stories are suitable for young readers.
@environmentLaw
reduce plastic waste|减少塑料垃圾|The law could help reduce plastic waste.
protect the environment|保护环境|Rules can encourage people to protect the environment.
follow the rules|遵守规定|Businesses should follow the rules on waste.
encourage people to recycle|鼓励人们回收利用|The government can encourage people to recycle.
@programme
watch an episode|看一集|I watched an episode after dinner.
learn something useful|学到实用的东西|I like programmes that help me learn something useful.
keep me interested|让我保持兴趣|Short videos keep me interested if the topic is clear.
share it with a friend|把它分享给朋友|I share a good programme with a friend.
@festivalFood
prepare a traditional dish|准备一道传统菜|My family prepares a traditional dish at New Year.
share a meal with family|和家人一起吃饭|We share a meal with family during the festival.
pass on a tradition|传承传统|Cooking together helps us pass on a tradition.
be part of the celebration|是庆祝活动的一部分|Special food is an important part of the celebration.
@law
make public places safer|让公共场所更安全|A new law could make public places safer.
protect people's rights|保护人们的权利|Laws should protect people's rights.
explain the rules clearly|把规定解释清楚|The government needs to explain the rules clearly.
be fair to everyone|对每个人公平|A good rule should be fair to everyone.
@nature
spend time outdoors|在户外活动|I enjoy spending time outdoors at the weekend.
enjoy the natural scenery|欣赏自然风景|Visitors can enjoy the natural scenery around the lake.
get away from city life|暂时远离城市生活|I go there to get away from city life.
protect local wildlife|保护当地野生动物|Visitors should help protect local wildlife.
@building
stand out from other buildings|和其他建筑相比很显眼|This building stands out because of its shape.
have a modern design|设计现代|The library has a modern design.
be used by local people|供当地人使用|The building is used by local people every day.
fit in with the surroundings|与周围环境协调|New buildings should fit in with the surroundings.
@noise
be full of noise|很吵|The station was full of noise during rush hour.
find it hard to concentrate|难以集中注意力|I find it hard to concentrate in noisy places.
move to a quieter place|换到安静点的地方|I moved to a quieter place to make a phone call.
keep the noise down|控制音量|People should keep the noise down in shared spaces.
@crowds
be packed with people|挤满了人|The market was packed with people.
wait in a long queue|排长队|We had to wait in a long queue to get in.
feel uncomfortable in a crowd|在人群中感到不自在|I sometimes feel uncomfortable in a crowd.
avoid busy times|避开繁忙时段|I try to avoid busy times when I go shopping.
@city
get around easily|出行方便|Visitors can get around easily by bus.
try the local food|尝试当地美食|I always try the local food when I visit a city.
have plenty to see and do|有很多可看可玩的|The city has plenty to see and do.
be worth visiting again|值得再去一次|I think this city is worth visiting again.
@water
walk along the river|沿河散步|I like walking along the river in the evening.
provide water for local people|为当地人供水|The lake provides water for local people.
keep the water clean|保持水的清洁|We need to keep the water clean.
be important to the local area|对当地很重要|The river is important to the local area.
@homeVisit
feel welcome in someone's home|在别人家感到受欢迎|I felt welcome in my friend's home.
be too far from work|离工作地点太远|The house is too far from work for me.
have little privacy|缺少私人空间|People may have little privacy in a shared home.
suit my way of life|适合我的生活方式|I prefer a home that suits my way of life.
@boringPlace
have very little to do|几乎没什么可做的|There was very little to do in the town.
lack interesting activities|缺少有趣的活动|The area lacks interesting activities for young people.
wish I had gone somewhere else|希望当时去了别的地方|I wished I had gone somewhere else that day.
make a place more attractive|让一个地方更有吸引力|Free events can make a place more attractive.
`;
  var current;
  source.trim().split('\n').forEach(function (line) {
    if (line.charAt(0) === '@') { current = line.slice(1); banks[current] = []; }
    else { var p = line.split('|'); if (p.length !== 3) throw new Error('Invalid vocabulary entry'); banks[current].push({en:p[0],zh:p[1],example:p[2]}); }
  });
  var angles = {
    communication:['Communication · 沟通','怎样交流、合作或理解对方？'],
    health:['Health · 健康','对身体、睡眠或心理状态有什么影响？'],
    education:['Education · 学习','能学到什么，怎样学得更好？'],
    economy:['Economy · 金钱','要花多少钱，能否省钱或提供价值？'],
    relaxation:['Relaxation · 放松','怎样休息、享受活动或缓解压力？'],
    sentimental:['Sentimental · 情感','有什么回忆、感受或关系？'],
    personality:['Personality · 性格','这个人有什么性格特点？'],
    interest:['Interest · 兴趣','为什么喜欢、好奇或不感兴趣？'],
    profession:['Profession · 职业','和工作、职责或职业选择有什么关系？'],
    strength:['Strength · 优点与长处','人擅长什么，或事物有什么好处？'],
    weakness:['Weakness · 不足与困难','有哪些不足、困难或限制？']
  };
  var assignments = `
Feeling bored|weakness,weakness,relaxation,relaxation
Names|communication,sentimental,personality,education
Friends|communication,interest,sentimental,relaxation
Advertisements|interest,economy,weakness,education
Shoes|health,economy,strength,weakness
Emails|communication,communication,communication,profession
Street markets|health,interest,economy,economy
Lost and found|weakness,weakness,personality,communication
Collecting things|interest,sentimental,sentimental,weakness
Computers|profession,education,strength,weakness
Growing vegetables|interest,health,education,weakness
Politeness|communication,personality,personality,personality
Rubbish|personality,health,education,strength
Tiredness|health,health,relaxation,weakness
Travelling|relaxation,sentimental,personality,interest
Papers|interest,education,sentimental,education
Secondary schools|weakness,communication,weakness,sentimental
Study|interest,education,education,education
Work|profession,communication,weakness,education
Hometown|sentimental,interest,strength,sentimental
The area you live in|relaxation,strength,strength,communication
Accommodation|economy,strength,strength,sentimental
History|education,interest,education,education
Headphones|communication,strength,health,interest
Mirrors|personality,interest,strength,strength
Websites|interest,strength,education,strength
Evening time|relaxation,relaxation,health,sentimental
Old buildings|education,sentimental,strength,strength
Watches|strength,interest,personality,sentimental
Singing|interest,weakness,relaxation,personality
Outer space and stars|interest,education,interest,interest
Teachers|strength,personality,education,education
Ambition and dreams|personality,profession,education,interest
Cinema|interest,weakness,strength,economy
Social media|relaxation,communication,weakness,education
Science|education,education,strength,interest
Public gardens and parks|health,health,relaxation,strength
Cars|weakness,economy,weakness,economy
Shopping|economy,economy,personality,economy
Tidiness|personality,personality,strength,personality
Music|relaxation,interest,interest,sentimental
Clothes|relaxation,profession,strength,sentimental
Jokes|personality,communication,communication,sentimental
popular|personality,sentimental,strength,communication
sports|health,strength,personality,interest
health|health,health,health,sentimental
older|strength,education,personality,strength
craft|interest,strength,sentimental,education
photos|sentimental,interest,education,sentimental
meeting|communication,personality,interest,sentimental
success|personality,strength,personality,sentimental
happy|personality,relaxation,sentimental,sentimental
languages|education,weakness,education,communication
business|profession,strength,weakness,economy
medical|profession,weakness,strength,sentimental
time|strength,strength,weakness,personality
party|communication,sentimental,sentimental,personality
decision|personality,education,communication,weakness
commute|profession,weakness,weakness,relaxation
listening|interest,personality,communication,education
gift|economy,strength,sentimental,sentimental
service|strength,communication,weakness,economy
wasteTime|weakness,weakness,personality,strength
interview|communication,communication,education,education
lesson|education,strength,education,sentimental
budgetTrip|economy,economy,relaxation,relaxation
reply|weakness,communication,communication,communication
techProblem|weakness,education,communication,strength
groupWork|personality,communication,strength,sentimental
cake|sentimental,communication,interest,sentimental
early|personality,strength,health,strength
film|interest,weakness,sentimental,communication
book|interest,interest,education,strength
environmentLaw|strength,health,personality,education
programme|relaxation,education,interest,communication
festivalFood|interest,sentimental,education,sentimental
law|health,strength,communication,personality
nature|relaxation,interest,health,personality
building|strength,interest,strength,strength
noise|weakness,health,relaxation,personality
crowds|weakness,weakness,sentimental,strength
city|strength,interest,relaxation,interest
water|relaxation,strength,health,strength
homeVisit|sentimental,profession,weakness,personality
boringPlace|weakness,interest,sentimental,strength
`;
  assignments.trim().split('\n').forEach(function(line){var p=line.split('|'), ids=p[1].split(',');banks[p[0]].forEach(function(entry,i){entry.angle=ids[i];});});
  var supplements = `
Feeling bored|education|learn a new skill|学一项新技能|Learning a new skill gives me something interesting to do.
Feeling bored|sentimental|feel lonely|觉得孤单|I sometimes feel lonely when I spend the whole day alone.
Friends|health|feel less lonely|感到不那么孤单|Talking to friends helps me feel less lonely.
Friends|economy|share the cost|分摊费用|We share the cost when we take a taxi together.
Friends|personality|be a good listener|善于倾听|My best friend is a good listener when I need to talk.
Study|strength|be good at practical tasks|擅长实践任务|I am good at practical tasks, especially group projects.
Study|weakness|struggle with memorising facts|记事实有困难|I struggle with memorising facts, so I use small cards.
Study|profession|prepare for a future career|为未来职业做准备|My course helps me prepare for a future career.
Work|economy|earn a regular income|有稳定收入|This job allows me to earn a regular income.
Work|sentimental|feel proud of my work|为工作感到自豪|I feel proud of my work when my students improve.
Shoes|economy|be worth the money|物有所值|Comfortable shoes are worth the money if I wear them every day.
Shoes|sentimental|remind me of a special occasion|让我想起特别的场合|These shoes remind me of my graduation day.
Advertisements|communication|send a clear message|传递清楚的信息|A good advert sends a clear message about the product.
Advertisements|weakness|make a product look better than it is|把产品说得比实际更好|Some adverts make a product look better than it is.
Emails|weakness|miss an important message|漏看重要信息|I sometimes miss an important message when my inbox is full.
Emails|strength|keep a written record|保留文字记录|Emails help people keep a written record of a decision.
Street markets|communication|chat with local sellers|和当地摊主聊天|I enjoy chatting with local sellers at the market.
Street markets|sentimental|remind me of my childhood|让我想起童年|The street market reminds me of my childhood.
Lost and found|sentimental|feel relieved|感到如释重负|I felt relieved when I found my wallet.
Collecting things|economy|spend money on my collection|在收藏上花钱|I try not to spend too much money on my collection.
Computers|communication|keep in touch online|在网上保持联系|Computers help people keep in touch online.
Computers|health|take breaks from the screen|离开屏幕休息|I take breaks from the screen to rest my eyes.
Growing vegetables|economy|save money on food|节省买食物的钱|Growing some vegetables can save money on food.
Growing vegetables|relaxation|enjoy working outdoors|享受户外劳作|I enjoy working outdoors because it helps me relax.
Politeness|communication|avoid an argument|避免争吵|Speaking politely can help avoid an argument.
Rubbish|economy|reuse things instead of buying new ones|重复使用物品而不买新的|We can save money by reusing things instead of buying new ones.
Tiredness|profession|work late|工作到很晚|I feel tired if I work late several nights in a row.
Travelling|economy|travel on a budget|按有限预算旅行|Students often need to travel on a budget.
Travelling|education|learn about another culture|了解另一种文化|Travelling helps me learn about another culture.
Papers|sentimental|feel more personal|感觉更有私人心意|A handwritten letter feels more personal than a quick message.
Secondary schools|education|build confidence in class|在课堂上建立自信|Small group activities helped me build confidence in class.
Hometown|economy|have a lower cost of living|生活成本较低|My hometown has a lower cost of living than a big city.
The area you live in|weakness|be noisy at night|晚上吵闹|The area can be noisy at night because of nearby restaurants.
Accommodation|weakness|have to share a bathroom|不得不共用浴室|I have to share a bathroom with my flatmates.
History|sentimental|feel connected to the past|觉得和过去有联系|Old family stories make me feel connected to the past.
Headphones|relaxation|enjoy music on the way home|在回家路上享受音乐|Headphones let me enjoy music on the way home.
Mirrors|weakness|worry too much about my appearance|过于担心外表|Looking in the mirror too often can make me worry too much about my appearance.
Websites|economy|compare prices online|在网上比价|Shopping websites let me compare prices online.
Evening time|education|read a few pages before bed|睡前读几页书|I like to read a few pages before bed.
Old buildings|economy|cost a lot to repair|修缮费用高|Some old buildings cost a lot to repair.
Watches|economy|choose an affordable watch|选价格可负担的手表|I would choose an affordable watch rather than an expensive brand.
Singing|communication|sing together|一起唱歌|Singing together can help people feel closer.
Outer space and stars|economy|cost a huge amount of money|花费巨额资金|Space travel costs a huge amount of money.
Teachers|sentimental|make me feel supported|让我感到被支持|A patient teacher makes me feel supported.
Ambition and dreams|weakness|be unsure about the future|对未来不确定|I am sometimes unsure about the future, but I keep trying.
Cinema|sentimental|share the experience with friends|和朋友分享这段体验|I enjoy sharing the experience with friends at the cinema.
Social media|health|affect my sleep|影响我的睡眠|Using social media late at night can affect my sleep.
Science|profession|use science at work|在工作中运用科学|Doctors and engineers use science at work.
Public gardens and parks|economy|be free to enter|免费进入|Public parks should be free to enter.
Cars|health|cause air pollution|造成空气污染|Too many cars can cause air pollution in cities.
Shopping|sentimental|buy something to cheer myself up|买东西让自己开心|I sometimes buy something small to cheer myself up.
Tidiness|health|feel less stressed|感到压力小一些|A tidy room helps me feel less stressed.
Music|communication|share a favourite song|分享喜欢的歌曲|I share a favourite song with friends who like similar music.
Clothes|economy|wait for a sale|等打折|I often wait for a sale before buying new clothes.
Jokes|relaxation|help people relax|帮助人们放松|A light joke can help people relax before a meeting.
popular|weakness|feel pressure to be liked|感到要被人喜欢的压力|Some students feel pressure to be liked by everyone.
sports|economy|pay for training|支付训练费|Some families cannot afford to pay for extra training.
health|communication|give friendly advice|给友善的建议|I gave friendly advice instead of telling my friend what to do.
older|communication|listen to their stories|听他们讲故事|I enjoy listening to older people's stories.
craft|economy|sell handmade items|售卖手工制品|Some people sell handmade items to earn extra money.
photos|communication|share photos with family|和家人分享照片|I share photos with family members who live far away.
success|weakness|make mistakes along the way|在过程中犯错|People often make mistakes along the way before they succeed.
happy|health|deal with stress|应对压力|Happy people still need ways to deal with stress.
languages|profession|have more job opportunities|有更多工作机会|Learning another language can give people more job opportunities.
business|communication|listen to customer feedback|听取顾客反馈|Good business owners listen to customer feedback.
medical|education|keep learning new skills|不断学习新技能|Medical workers need to keep learning new skills.
time|relaxation|have more time to relax|有更多时间放松|Planning my day gives me more time to relax.
party|economy|keep the cost down|降低开支|We kept the cost down by making food at home.
decision|weakness|be afraid of making the wrong choice|害怕选错|I was afraid of making the wrong choice at first.
gift|personality|think about the other person's interests|考虑对方的兴趣|I think about the other person's interests when choosing a gift.
service|profession|train staff well|把员工培训好|Shops need to train staff well to provide good service.
groupWork|weakness|disagree about what to do|对做什么意见不合|We sometimes disagree about what to do, so we discuss our ideas.
film|relaxation|switch off after a busy day|忙了一天后放松脑子|Watching a simple film helps me switch off after a busy day.
book|relaxation|read to relax|通过阅读放松|I read to relax before I go to bed.
nature|economy|attract visitors to the area|吸引游客来到当地|Beautiful natural places attract visitors to the area.
city|weakness|have a high cost of living|生活成本高|Large cities often have a high cost of living.
water|economy|support local businesses|支持当地生意|Visitors to the lake support local businesses.
building|economy|be expensive to build|建造费用高|Very tall buildings can be expensive to build.
`;
  supplements.trim().split('\n').forEach(function(line){var p=line.split('|');banks[p[0]].push({angle:p[1],en:p[2],zh:p[3],example:p[4]});});
  var topicMap = {
    'A popular person':'popular',
    'An athlete/sports team you admire':'sports',
    'Someone you have helped to become healthier':'health',
    'A person who taught you something':'Teachers',
    'An old person you know and respect':'older',
    'A person who likes to make things by hand':'craft',
    'A person who enjoys learning history':'History',
    'An organized person':'time,Tidiness',
    'A person you know who really likes taking photos':'photos',
    'A person you only met once':'meeting',
    'A person who did something difficult and was successful':'success',
    'A happy person you know':'happy',
    'A person who is good at learning and speaking new languages':'languages',
    'A successful business person you admire':'business',
    'A person you know who loves to grow plants':'Growing vegetables',
    'A person who has chosen a career in the medical field':'medical',
    'Your favourite childhood friend':'Friends',
    'A recent change that helps you save time':'time',
    'An occasion when you lost something in a public place':'Lost and found',
    'A party you enjoyed':'party',
    'A time when you changed an important decision':'decision',
    'A short trip you often do but you don’t like':'commute',
    'A time when someone told you something you are not interested in':'listening',
    'A time when you saved money to buy an expensive gift for others':'gift',
    'A time when you received good service in a shop/store':'service',
    'An activity wastes your time':'wasteTime',
    'An enjoyable evening you had with your friends':'Evening time,party',
    'A time you watched a famous person being interviewed':'interview',
    'A new skill you learned when you were a child':'lesson',
    'A lesson impressed you a lot':'lesson',
    'A time when you made an important decision':'decision',
    'A happy event you organized':'party,time',
    'A special day out that did not cost you much':'budgetTrip',
    'A time when you received a message or email and it took you a long time to reply':'reply',
    'A challenging technological problem you faced':'techProblem',
    'An important decision you made in life':'decision',
    'A live sports event you watched before':'sports',
    'A plan that you had to change recently':'decision',
    'A time when you worked in a group':'groupWork',
    'An occasion when you had a special cake':'cake',
    'A time when you got up early':'early',
    "A film you didn't like":'film',
    'An exciting book you enjoy reading':'book',
    'A gift for your friend':'gift',
    'A law or regulation about environmental protection':'environmentLaw',
    'An ambition that you have had for a long time':'Ambition and dreams',
    'Something helped you to learn a foreign language':'languages',
    'A story/book with animals in it':'book',
    'A TV show/online program you have watched recently':'programme',
    'An advertisement with a famous person in it':'Advertisements',
    'A kind of food people eat during special event':'festivalFood',
    'An interesting video':'programme',
    'A new law you would like to introduce in your country':'law',
    'Somewhere near a natural place':'nature',
    'A building you like':'building',
    'A noisy place you have been to':'noise',
    'A natural place':'nature',
    'A crowded place you went to':'crowds',
    'A city you have been to and would like to visit again':'city',
    'An important river/lake':'water',
    'A place in your country that you would like to recommend to travelers':'city,nature',
    'A friend’s home you visited but you don’t want to live there':'homeVisit',
    'A place you would like to visit in your free time':'nature,city',
    'A boring place':'boringPlace',
    'Your favorite city that you have visited':'city',
    'A tall building in your city you like or dislike':'building'
  };
  if (window.IELTSTextbookVocabulary2027) {
    var textbook2027 = window.IELTSTextbookVocabulary2027;
    Object.keys(textbook2027.banks || {}).forEach(function (key) {
      banks[key] = (banks[key] || []).concat(textbook2027.banks[key]);
    });
    Object.assign(topicMap, textbook2027.topicMap || {});
    Object.assign(topicMap, textbook2027.questionMap || {});
    window.IELTSTextbookQuestionMap2027 = textbook2027.questionMap || {};
  }
  function entriesFor(title, level) {
    var keys = (topicMap[title] || (banks[title] ? title : '')).split(','), out = [];
    keys.forEach(function (key) {
      var basic = (banks[key] || []).map(function(entry){return Object.assign({level:'B1'},entry);});
      var extended = (window.IELTSVocabularyLevels && window.IELTSVocabularyLevels.banks[key]) || [];
      basic.concat(extended).forEach(function (entry) { if ((!level || entry.level === level) && !out.some(function (x) { return x.en === entry.en && x.level === entry.level; })) out.push(entry); });
    });
    return out;
  }
  function entryHtml(entry) {
    return '<div class="b1Entry"><strong>'+esc(entry.en)+'</strong><span class="b1Meaning">'+esc(entry.zh)+'</span><div class="b1Example">'+esc(entry.example)+'</div></div>';
  }
  function levelHtml(title, level) {
    var entries=entriesFor(title,level), help={B1:'用常用词组说清楚自己的经历',B2:'用更丰富的搭配扩展和评价',C1:'准确表达细微区别、取舍和影响'};
    return '<section class="vocabLevel" data-level="'+level+'"><h3>'+level+' <span>'+entries.length+' 条</span></h3><p class="b1Help">'+help[level]+'</p>'+Object.keys(angles).filter(function(id){return entries.some(function(e){return e.angle===id;});}).map(function(id){return '<section class="b1Angle"><h4>'+esc(angles[id][0])+'</h4><div class="b1Grid">'+entries.filter(function(e){return e.angle===id;}).map(entryHtml).join('')+'</div></section>';}).join('')+'</section>';
  }
  function topicHintHtml(title) {
    var group=(window.G||[]).find(function(g){return g.title===title;}), part=group?group.part:'';
    if(!part && window.PG)part=window.PG.part;
    var guide=part==='p2'?'先确认题卡的人物、事件或地点，选一个具体细节，再说说你的感受。':'先直接回答问题，选一个贴合题目的理由，再用自己的例子解释。';
    var hints=entriesFor(title,'B1').concat(entriesFor(title,'B2'),entriesFor(title,'C1')).slice(0,2);
    return '<details class="topicHint"><summary>本题提示</summary><p class="b1Help">'+esc(guide)+'</p><p class="b1Help">先自己尝试，需要表达时再展开下面的词伙。</p>'+(hints.length?'<details class="topicHintWords"><summary>再给我两个词伙</summary><div class="b1Grid">'+hints.map(entryHtml).join('')+'</div></details>':'')+'</details>';
  }
  function html(title, open) {
    var entries = entriesFor(title); if (!entries.length) return '';
    var terms=entriesFor(title,'T');
    return '<details class="b1Vocab"'+(open?' open':'')+'><summary>话题词库 · B1 / B2 / C1 · '+entries.length+' 条</summary><div class="b1Body">'+topicHintHtml(title)+'<p class="b1Help">'+esc(title)+' · 先积累具体的话题名词，再从 CHEERS / 人物角度选 2–3 个表达组织回答。B1、B2、C1 为学习梯度参考，话题术语不代表固定等级；例句可改写成自己的经历。</p>'+(terms.length?'<section class="vocabTerms"><h3>话题名词与类型 <span>'+terms.length+' 条</span></h3><div class="b1Grid">'+terms.map(entryHtml).join('')+'</div></section>':'')+'<div class="vocabLevels">'+['B1','B2','C1'].map(function(level){return levelHtml(title,level);}).join('')+'</div><p class="b1Help">用法练习：说清对象或类型 → 用一个表达解释原因 → 补充例子或限制。选择准确、自然的表达即可。</p></div></details>';
  }
  var style = document.createElement('style');
  style.textContent = '.b1Vocab{margin:12px 0;border:1px solid #dfd8e4;border-radius:12px;background:#f9f7fb;color:#3b2c47}.b1Vocab summary{padding:12px 14px;font-weight:700;cursor:pointer;font-size:14px}.b1Body{padding:0 14px 12px}.b1Help{font-size:12px;line-height:1.7;color:#6c577c;margin:4px 0 12px}.b1Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:10px}.b1Entry{padding:12px;background:white;border:1px solid #eae0f1;border-radius:9px;line-height:1.6}.b1Entry strong{display:block;color:#795d96;font-size:15px}.b1Meaning{display:block;font-size:13px;margin:3px 0}.b1Example{font-size:13px;color:#594569;border-top:1px solid #f2eef5;padding-top:7px;margin-top:7px}.b1Vocab summary:focus-visible{outline:3px solid #795d96;outline-offset:2px}';
  style.textContent += '.vocabTerms{padding-bottom:14px;border-bottom:1px solid #dfd8e4}.vocabTerms h3,.vocabLevel h3{font-size:15px;margin:12px 0 8px;color:#795d96}.vocabTerms h3 span,.vocabLevel h3 span{font-size:12px;font-weight:400;color:#7e6591}.vocabLevels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}.vocabLevel{min-width:0;border:1px solid #e3dde8;border-radius:10px;padding:0 10px 10px;background:#f5f0f8}.vocabLevel[data-level=B2]{background:#edf8f3}.vocabLevel[data-level=C1]{background:#f4effb}.vocabLevel .b1Grid{grid-template-columns:minmax(0,1fr)}.b1Entry{overflow-wrap:anywhere}@media(max-width:780px){.vocabLevels{grid-template-columns:minmax(0,1fr)}}';
  document.head.appendChild(style);
  style.textContent += '.topicHint{margin:8px 0 12px;padding:0 10px 10px;border:1px solid #dfd8e4;border-radius:9px;background:#fff}.topicHint>summary,.topicHintWords>summary{color:#795d96;font-size:13px;padding:10px 0}.topicHint .b1Help{margin-bottom:7px}.topicHintWords .b1Grid{margin-top:8px}';
  style.textContent += '.b1Angle{margin:14px 0}.b1Angle h4{font-size:13px;margin:0 0 4px;color:#563470}';
  window.IELTSTopicVocabulary = {banks:banks, topicMap:topicMap, angles:angles, entriesFor:entriesFor, renderHtml:html};
  if (typeof window.IELTSVocabularyPage === 'function') { window.IELTSVocabularyPage(); return; }
  // Replace extracted fragments; leave the original question bank and answer models intact.
  var browse = renderBrowse;
  renderBrowse = function () {
    browse();
    document.querySelectorAll('#list .card').forEach(function (card) {
      var heading = card.querySelector('.ptitle'); if (!heading) return;
      var clone = heading.cloneNode(true); clone.querySelectorAll('.badge').forEach(function (badge) { badge.remove(); });
      var title = clone.textContent.trim();
      var old = card.querySelector('.topicVocab'); if (old) old.remove();
      heading.insertAdjacentHTML('afterend', html(title, false));
    });
  };
  function showPracticeBank() {
    var box = document.getElementById('trainBox'); if (!box || !PG) return;
    box.querySelectorAll('.b1Vocab, .trainVocab').forEach(function (el) { el.remove(); });
    var title = PCUR && topicMap[PCUR.t] ? PCUR.t : PG.title;
    var material = box.querySelector('.qmMaterial');
    var bank = html(title, PG.part !== 'p3');
    if (material) material.insertAdjacentHTML('afterend', bank);
    else box.insertAdjacentHTML('afterbegin', bank);
  }
  var train = renderTrainStep;
  renderTrainStep = function () { train(); showPracticeBank(); };
  var step = renderP3Step;
  renderP3Step = function () { step(); showPracticeBank(); };
  var toolkit = p3RenderToolkit;
  p3AnglesHtml = function () { return '<div class="p3ExampleHint">先查看这道问题的扣题素材，选择贴合问题的理由和例子；需要更多表达时再展开话题词库，用 CHEERS / 人物角度补充。</div>'; };
  p3RenderToolkit = function () {
    toolkit();
    document.querySelectorAll('#p3toolkit .p3Ex .p3Words').forEach(function (el) { el.remove(); });
    document.querySelectorAll('#p3toolkit .p3Kit > b').forEach(function (el) { if (el.textContent === '可用词伙') el.textContent = '连接和分类表达'; if (el.textContent === '八角度思考卡') el.textContent = 'CHEERS / 人物角度'; });
  };
  // Expose the authored content for coverage checks and future maintenance.
  window.IELTSTopicVocabulary = {banks:banks, topicMap:topicMap, angles:angles, entriesFor:entriesFor, renderHtml:html};
  if (MODE === 'browse') renderBrowse(); else if (PG && PCUR) showPracticeBank();
})();
