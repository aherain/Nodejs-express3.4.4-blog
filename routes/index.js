
/*
 * GET home page.
 */
/*
exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};*/

var crypto=require('crypto'),
fs=require('fs'),
User=require('../models/user.js'),
Post=require('../models/post.js'),
Comment=require('../models/comment.js');
module.exports=function(app){
	/*app.get('/', function(req,res){
		Post.getAll(null,function(err,posts){
			if(err){
				posts=[];
				}
		res.render('index',{title:'微博主页',
		                    user:req.session.user,
							posts:posts,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
		});
		});
	
		});*/
		
	app.get('/',function(req,res){
		//判断是否是第一页，并把请求的页数转换成number类型
		var page=req.query.p?parseInt(req.query.p):1;
		//查询并返回第page页的10 篇文章
		Post.getTen(null,page,function(err,posts,total){
			if(err){
				posts=[];
				}
				res.render('index',{
					title:'主页',
					posts:posts,
					page:page,
					isFirstPage:(page-1)==0,
					isLastPage:((page-1)*10+posts.length)==total,
					user:req.session.user,
					success:req.flash('success').toString(),
					error:req.flash('error').toString()
					});
			});
		
		});
		
		/*app.get('/heyu', function(req,res){
		res.render('index',{title:'欢迎何雨学习NODEJS'});
		});
		
		app.get('/heyu/123', function(req,res){
		res.send('<h1>欢迎你进入123信息管理平台\n,<br/>这里将是你梦想开始的地方\</h1>');
		});*/
		
		app.get('/reg',checkNotLogin);
		app.get('/reg', function(req,res){
		res.render('reg',{title:'微博注册',
		                   user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString() 
		});
		});
		app.post('/reg',checkNotLogin);
		app.post('/reg', function(req,res){
			var  name=req.body.name,
			     password=req.body.password,
				 password_re=req.body['password-repeat'];
				 //检验用户两次输入的密码是否一致；
				 
				 if(password_re!=password){
					 req.flash('error','两次密码输入的不一致，请重新输入');
					 console.log(password_re+','+password)
					 return res.redirect('/reg');//返回到注册页面
					 }
					 //生成密码的md5值
					 var md5=crypto.createHash('md5'),
					 password=md5.update(req.body.password).digest('hex');
					 var newUser=new User({
						 name:req.body.name,
						 password:password,
						 email:req.body.email
						 });
						 //检查用户是佛偶已经存在
						 User.get(newUser.name,function(err,user){
							 if(user){
								 req.flash('error','用户已经存在!');
								 return res.redirect('/reg');//返回注册页面
								 }
								 //如果不存在新用户
								 newUser.save(function(err,user){
									 if(err){
										 req.flash('error',err);
										 return res.redirect('/reg');
										 }
										 req.session.user=user;//用户信息存入session
										 req.flash('success','注册成功！');
										 res.redirect('/');//注册成功后返回主页
									 });
							 
						 });
				 
		
		});
		app.get('/login',checkNotLogin);
		app.get('/login', function(req,res){
		res.render('login',{title:'微博登陆',
		
		                    user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
		});
		});
		app.post('/login',checkNotLogin);
		app.post('/login', function(req,res){
			//生成密码的md5值
			var md5=crypto.createHash('md5'),
			    password=md5.update(req.body.password).digest('hex');
				//检查用户是否存在
				User.get(req.body.name,function(err,user){
					if(!user){
						req.flash('error','用户不存在');
						return res.redirect('/login');//密码错误跳转到登陆页
						
						}
					//检查密码是否一致
					if(user.password!=password){
						req.flash('error','密码错误');
						return res.redirect('/login');//密码错误跳转到登陆页面
						
						}
						//用户名密码都匹配后，将用户信息存入session
						req.session.user=user;
						req.flash('success','成功');
						res.redirect('/');//登陆成功后跳转到主页
						
					});
		
		});
		
		app.get('/post',checkLogin);
		app.get('/post', function(req,res){
		res.render('post',{title:'微博发表',
		                    user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
		});
		});
		app.post('/post',checkLogin);
		app.post('/post', function(req,res){
		var currentUser=req.session.user,
		tags=[req.body.tag1,req.body.tag2,req.body.tag3],
		  post=new Post(currentUser.name,currentUser.head,req.body.title,tags,req.body.content);
		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
				}
			req.flash('error','发布成功');
			res.redirect('/');//发表成功跳转到转到2主页
			}); 
		});
		
		app.get('/logout',checkLogin);
		app.get('/logout', function(req,res){
			req.session.user=null;
			req.flash('success','登出成功');
			res.redirect('/');//登出成功后跳转到主页
		
		});
		
		app.get('/upload',checkLogin);
		app.get('/upload',function(req,res){
			res.render('upload',{
				title:'文件上传',
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
				});
			});
			
		app.post('/upload',checkLogin);
		app.post('/upload',function(req,res){
			for(var i in req.files){
				if(req.files[i].size==0){
					//使用同步的方式删除一个文件
					
					
				console.log('*********************************************************');
				  fs.unlinkSync(req.files[i].path);
				   console.log('Successfully removed an empty file!');
					}else{
						var target_path='./public/images/'+req.files[i].name;
						//使用同步的方式重命名一个文件
										console.log('----------------------------------------------------');

						console.log(req.files[i].path);
						
						console.log(target_path);
										console.log('///////////////////////////////////');

						fs.renameSync(req.files[i].path, target_path);
						console.log("Successfully renamed a file!");
						}
				}
			 req.flash('success','恭喜你，文件上传成功！');
			 res.redirect('/upload');
			});
			
		/*//获取精确的一篇文章
		app.get('/u/:name',function(req,res){
			//检查用户是否存在
			User.get(req.params.name,function(err,user){
				if(!user){
					req.flash('error','用户名不存在');
					return res.redirect('/');//用户不存在则跳转到主页
					}
				//查询并返回该用户的所有文章
				Post.getAll(user.name,function(err,posts){
					if(err){
						req.flash('error',err);
						return res.redirect('/');
						}
						res.render('user',{
							title:user.name,
							posts:posts,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							
							});
						
						});
				});
			});*/
			//归档渲染
			app.get('/archive',function(req,res){
				Post.getArchive(function(err,posts){
					if(err){
						req.flash('error',err);
						return res.redirect('/');
						}
						res.render('archive',{
							title:'存档',
							posts:posts,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString(),
							});
					});
				});
			//添加标签的路由控制
			app.get('/tags',function(req,res){
				Post.getTags(function(err,posts){
					if(err){
						req.flash('error',err);
						return res.redirect('/');
						}
						res.render('tags',{
							title:'标签',
							posts:posts,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							});
					});
				});
				//特定标签，指向的文档集合
				app.get('/tags/:tag', function(req,res){
					Post.getTag(req.params.tag,function(err,posts){
						if(err){
							req.flash('error',err);
							return res.redirect('/');
							}
						res.render('tag',{
							title:'TAG:'+req.params.tag,
							posts:posts,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							});
						});
					});
					
					
					//友情链接路由控制
					app.get('/links',function(req,res){
						res.render('links',{
							title:'友情链接',
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							});
						});
						//
						//文章检索的路由控制
						app.get('/search',function(req,res){
							Post.search(req.query.keyword,function(err,posts){
								if(err){
									req.flash('error',err);
									return res.redirect('/');
									}
									res.render('search',{
										title:"SEARCH:"+req.query.keyword,
										posts:posts,
										user:req.session.user,
										success:req.flash('success').toString(),
										error:req.flash('error').toString()
										});
								});
							});
			app.get('/u/:name',function(req,res){
				var page=req.query.p?parseInt(req.query.p):1;
				//检查用户是否存在
				User.get(req.params.name,function(err,user){
					if(!user){
						req.flash('error','用户不存在');
						return res.redirect('/');
						}
					//查询并返回该用户第page页的10 篇文章
					Post.getTen(user.name,page,function(err,posts,total){
						if(err){
							req.flash('error',err);
							return res.redirect('/');
							}
							
							res.render('user',{
								title:user.name,
								posts:posts,
								page:page,
								isFirstPage:(page-1)==0,
					            isLastPage:((page-1)*10+posts.length)==total,
					            user:req.session.user,
					            success:req.flash('success').toString(),
					            error:req.flash('error').toString()
								
								});
						});
					});
				
				});
				
			app.get('/u/:name/:day/:title',function(req,res){
				Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
					if(err){
						req.flash('error',err);
						return res.redirect('/');
						
						}
						res.render('article',{
							title:req.params.title,
							post:post,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							});
					});
				
				});
				
				//编辑的路由控制
				app.get('/edit/:name/:day/:title',checkLogin);
				app.get('/edit/:name/:day/:title',function(req,res){
				var currentUser=req.session.user;
				Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
					if(err){
						req.flash('error',err);
						return res.redirect('back');
						
						}
						res.render('edit',{
							title:'编辑',
							post:post,
							user:req.session.user,
							success:req.flash('success').toString(),
							error:req.flash('error').toString()
							});
					});
				
				});
				
				app.post('/edit/:name/:day/:title',checkLogin);
				app.post('/edit/:name/:day/:title',function(req,res){
				var currentUser=req.session.user;
				Post.update(currentUser.name,req.params.day,req.params.title,req.body.content,
				function(err){
					var url='/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title;
					if(err){
						req.flash('error',err);
						return res.redirect(url);//出错，返回文章页
					}
					req.flash('success','修改成功');
					res.redirect(url);//成功，返回文章页
					});
				
				});
				
				//删除一篇文章
				app.get('/remove/:name/:day/:title',checkLogin)
				app.get('/remove/:name/:day/:title',function(req,res){
				var currentUser=req.session.user;
				Post.remove(currentUser.name,req.params.day,req.params.title,
				function(err){
					if(err){
						req.flash('error',err);
						return res.redirect('back');
						}
						req.flash('success','删除成功！');
						res.redirect('/');
				});
		});
			
			//添加留言
			app.post('/u/:name/:day/:title',function(req,res){
				var date=new Date(),
				   time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
				   //这里可以修改图像
				   var md5=crypto.createHash('md5'),
		           email_MD5=md5.update(req.body.email.toLowerCase()).digest('hex'),
		           head="http://www.gravatar.com/avatar/"+email_MD5+"?s=48";
				   var comment={
					   name:req.body.name,
					   head:head,
					   email:req.body.email,
					   website:req.body.website,
					   time:time,
					   content:req.body.content
					   };
					   var newComment=new Comment(req.params.name,req.params.day,req.params.title,comment);
					   newComment.save(function(err){
						   if(err){
							   req.flash('error',err);
							   return res.redirect('back');
							   }
							   req.flash('success','留言成功');
							   res.redirect('back');
						   });
				});
			//判断用户是否在线
		app.use(function(req,res){
			res.render("404");
			});
		function checkLogin(req,res,next){
			if(!req.session.user){
				req.flash('error','未登录');
				res.redirect('/login');
				}
				next();
			}
			
			function checkNotLogin(req,res,next){
				if(req.session.user){
					req.flash('error','已登录！');
					res.redirect('back');
					}
					next();
				}
	};
	