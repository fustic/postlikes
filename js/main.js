var fbposts=function(){
	var self=this;
	self.pageName=ko.observable(config.page_name);
	self.posts=ko.observable();
	self.likes=ko.observable(null);
	self.GetPosts=function(){
		var p=[];
		var queryString="SELECT message,post_id, likes, app_data, action_links,impressions,is_hidden FROM stream WHERE source_id = "+config.page_id;		
		// console.log(queryString);

		FB.api('fql', { q: queryString },function(data){
			if(data.data){
				var img=[],
					posts=data.data;
				// console.log(data.data);
				$.map(data.data,function(val, i){
					if(val.app_data.photo_ids && val.app_data.photo_ids.length)
						img.push(val.app_data.photo_ids[0]);
					
				});
				self.GetImagesByIds(img.join(","),posts);
				// console.log(p);
				// self.posts(p);
			}
		});

	};
	self.GetImagesByIds=function(ids, pt){
		var images={},
			query='SELECT src, pid, object_id FROM photo WHERE object_id in ('+ids+')';
		FB.api("fql",{q:query},function(data){
			var object_id,
				p=[];
			if(data.data){
				$.map(data.data, function(val){
					images[val.object_id]={
						src:val.src,
						pid:val.pid
					};
				});

			}
			$.map(pt, function(val){
				if(val && val.message)
					object_id = val.app_data.photo_ids && val.app_data.photo_ids.length ? val.app_data.photo_ids[0] : null;
					p.push(
						new posts(
								val.message,
								object_id != null ? images[object_id].src : "",
								val.is_hidden,
								val.post_id
							)
					);
			});
			self.posts(p);
		});
	};
	self.GetLikes=function(post){
		return function(){
			var q='SELECT name,pic_square,birthday_date,sex,profile_url,email,contact_email from user WHERE uid in (SELECT user_id FROM like WHERE post_id="'+post.postID+'" LIMIT 100000)';
			FB.api("fql",{q:q},function(data){
				var l=[];
				if(data.data){
					$.map(data.data,function(val){
						l.push(new likes(val.profile_url, val.sex, val.name, val.pic_square));
					})
				}
				debugger;
				self.likes(l);
			});
		}
	};
};
var posts=function(mes,img,hidden,id){
	// this.postUrl=url;
	this.postMessage=mes;
	this.postImg=img;
	this.postID=id;
	this.hidden=hidden;
	return {
			postUrl:"this.postUrl", 
			postMessage:this.postMessage, 
			postImg:this.postImg, 
			hidden:this.hidden,
			postID:this.postID
		};
},
likes=function(url, sex, name, img){
	return {
		url:url,
		sex:sex,
		name:name,
		img:img
	};
};