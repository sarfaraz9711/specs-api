/*
 * spurtcommerce API
 * version 4.5.1
 * http://api.spurtcommerce.com
 *
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, Put, Post, Delete, Body, QueryParam, Param, JsonController, Authorized, Res, Req } from 'routing-controllers';
import { Blog } from '../models/Blog';
import { BlogService } from '../services/BlogService';
import { env } from '../../env';
import { CreateBlog } from './requests/CreateBlogRequest';
import { DeleteBlog } from './requests/DeleteBlogRequest';
import { S3Service } from '../services/S3Service';
import { ImageService } from '../services/ImageService';
import { CategoryService } from '../services/CategoryService';
import { BlogRelatedService } from '../services/BlogRelatedService';
import { BlogRelated } from '../models/BlogRelated';
import { CreateNewBlogRequest } from './requests/CreateNewBlogRequest';
import { BlogComment } from '../models/comment';
import { CreateCommentRequest } from './requests/CommentRequest';
import { CommentService } from '../services/CommentService';
import {  getManager } from 'typeorm';


@JsonController('/blog')
export class BlogController {
    constructor(private blogService: BlogService, private s3Service: S3Service, private blogRelatedService: BlogRelatedService,
                private imageService: ImageService, private categoryService: CategoryService,private commentService: CommentService) {
    }

    // Create Blog
    /**
     * @api {post} /api/blog/add-blog Add Blog API
     * @apiGroup Blog
     * @apiParam (Request body) {String} title title
     * @apiParam (Request body) {Number} categoryId category id
     * @apiParam (Request body) {String} description description
     * @apiParam (Request body) {String} image image
     * @apiParam (Request body) {Number} status status/isActive
     * @apiParam (Request body) {String} metaTagTitle meta tag title
     * @apiParam (Request body) {String} metaTagDescription meta tag description
     * @apiParam (Request body) {String} metaTagKeyword meta tag keyword
     * @apiParam (Request body) {String} relatedBlogId relatedBlogId
     * @apiParam (Request body) {String} blogSlug blogSlug
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "title" : "",
     *      "categoryId" : "",
     *      "description" : ""
     *      "image" : "",
     *      "status" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagkeyword" : "",
     *      "relatedBlogId" : [],
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New blog is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/blog/add-blog
     * @apiErrorExample {json} Add Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-blog')
    @Authorized(['admin', 'create-blogs'])
    public async createBlog(@Body({ validate: true }) blogParam: CreateBlog, @Req() request: any, @Res() response: any): Promise<any> {
        const category = blogParam.categoryId;
        const getcategory = await this.categoryService.findOne(category);
        if (!getcategory) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Category Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const image = blogParam.image;
        const newBlog = new Blog();
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const availableTypes = env.availImageTypes.split(',');
                if (!availableTypes.includes(type)) {
                    const errorTypeResponse: any = {
                        status: 0,
                        message: 'Only ' + env.availImageTypes + ' types are allowed',
                    };
                    return response.status(400).send(errorTypeResponse);
                }
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'blog/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            if (env.imageserver === 's3') {
                await this.s3Service.imageUpload((path + name), base64Data, type);
            } else {
                await this.imageService.imageUpload((path + name), base64Data);
            }
            newBlog.image = name;
            newBlog.imagePath = path;
        }
        newBlog.title = blogParam.title;
        newBlog.categoryId = blogParam.categoryId;
        newBlog.description = blogParam.description;
        newBlog.isActive = blogParam.status;
        newBlog.metaTagTitle = blogParam.metaTagTitle ? blogParam.metaTagTitle : blogParam.title;
        newBlog.metaTagDescription = blogParam.metaTagDescription;
        newBlog.metaTagKeyword = blogParam.metaTagKeyword;
        newBlog.createdBy = request.user.userId;
        const metaTagTitle = blogParam.blogSlug ? blogParam.blogSlug : blogParam.title;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        newBlog.blogSlug = await this.validate_slug(data);
        const blogSave = await this.blogService.create(newBlog);
        // Add related blog
        if (blogParam.relatedBlogId) {
            const relatedBlog: any = blogParam.relatedBlogId;
            for (const relatedblog of relatedBlog) {
                const newBlogRelated: any = new BlogRelated();
                newBlogRelated.blogId = blogSave.id;
                newBlogRelated.relatedBlogId = relatedblog;
                newBlogRelated.isActive = 1;
                await this.blogRelatedService.create(newBlogRelated);
            }
        }
        if (blogSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully created new blog.',
                data: blogSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to create new blog. ',
            };
            return response.status(400).send(errorResponse);
        }
    }
    // Blog List
    /**
     * @api {get} /api/blog/blog-list Blog List API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} categoryId categoryId
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Blog list",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/blog/blog-list
     * @apiErrorExample {json} Blog List error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/blog-list')
    @Authorized(['admin', 'list-blogs'])
    public async BlogList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('categoryId') categoryId: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['id', 'title', 'categoryId', 'description', 'image', 'imagePath', 'isActive', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'blogSlug', 'createdDate'];
        const search = [
            {
                name: 'title',
                op: 'like',
                value: keyword,
            }, {
                name: 'categoryId',
                op: 'like',
                value: categoryId,
            }, {
                name: 'isActive',
                op: 'where',
                value: status,
            },
        ];
        const WhereConditions = [];
        const getBlogList: any = await this.blogService.list(limit, offset, select, search, WhereConditions, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got blog count',
                data: getBlogList,
            };
            return response.status(200).send(successResponse);
        } else {
            const blogList = getBlogList.map(async (val: any) => {
                const datas: any = val;
                const getCategoryName = await this.categoryService.findOne({
                    where: { categoryId: val.categoryId },
                    select: ['name'],
                });
                if (getCategoryName) {
                    datas.categoryName = getCategoryName.name;
                }
                return datas;
            });
            const results = await Promise.all(blogList);
            const successResponse: any = {
                status: 1,
                message: 'Successfully got blog list',
                data: results,
            };
            return response.status(200).send(successResponse);
        }
    }
    // Update Blog
    /**
     * @api {put} /api/blog/update-blog/:id Update Blog API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title title
     * @apiParam (Request body) {Number} categoryId category id
     * @apiParam (Request body) {String} description description
     * @apiParam (Request body) {String} image image
     * @apiParam (Request body) {Number} status status/isActive
     * @apiParam (Request body) {String} metaTagTitle meta tag title
     * @apiParam (Request body) {String} metaTagDescription meta tag description
     * @apiParam (Request body) {String} metaTagKeyword meta tag keyword
     * @apiParam (Request body) {String} relatedBlogId relatedBlogId
     * @apiParamExample {json} Input
     * {
     *      "title" : "",
     *      "categoryId" : "",
     *      "description" : ""
     *      "image" : "",
     *      "status" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagkeyword" : "",
     *      "relatedBlogId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated blog.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/blog/update-blog/:id
     * @apiErrorExample {json} Update Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-blog/:id')
    @Authorized(['admin', 'edit-blogs'])
    public async updateBlog(@Param('id') blogId: number, @Body({ validate: true }) blogParam: CreateBlog, @Res() response: any, @Req() request: any): Promise<any> {
        const blog = await this.blogService.findOne(blogId);
        if (!blog) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid blog Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const category = blogParam.categoryId;
        const getcategory = await this.categoryService.findOne(category);
        if (!getcategory) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Category Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const image = blogParam.image;
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const availableTypes = env.availImageTypes.split(',');
                if (!availableTypes.includes(type)) {
                    const errorTypeResponse: any = {
                        status: 0,
                        message: 'Only ' + env.availImageTypes + ' types are allowed',
                    };
                    return response.status(400).send(errorTypeResponse);
                }
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'blog/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            if (env.imageserver === 's3') {
                await this.s3Service.imageUpload((path + name), base64Data, type);
            } else {
                await this.imageService.imageUpload((path + name), base64Data);
            }
            blog.image = name;
            blog.imagePath = path;
        }
        blog.title = blogParam.title;
        blog.categoryId = blogParam.categoryId;
        blog.description = blogParam.description;
        blog.isActive = blogParam.status;
        blog.metaTagTitle = blogParam.metaTagTitle ? blogParam.metaTagTitle : blogParam.title;
        blog.metaTagDescription = blogParam.metaTagDescription;
        blog.metaTagKeyword = blogParam.metaTagKeyword;
        blog.createdBy = request.user.userId;
        const metaTagTitle = blogParam.blogSlug ? blogParam.blogSlug : blogParam.title;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        blog.blogSlug = await this.validate_slug(data);
        const blogSave = await this.blogService.create(blog);
        const findBlog: any = await this.blogRelatedService.findOne({
            where: {
                blogId: blogSave.id,
            },
        });
        if (findBlog) {

            // delete previous related blog
            this.blogRelatedService.delete({ blogId: blogSave.id });

            // update related blog
            if (blogParam.relatedBlogId) {
                const relatedBlog: any = blogParam.relatedBlogId;
                for (const relatedblog of relatedBlog) {
                    const newRelatedBlog: any = new BlogRelated();
                    newRelatedBlog.blogId = blogSave.id;
                    newRelatedBlog.relatedBlogId = relatedblog;
                    await this.blogRelatedService.create(newRelatedBlog);
                }
            }
        } else {

            // update related blog
            if (blogParam.relatedBlogId) {
                const relatedBlog: any = blogParam.relatedBlogId;
                for (const relatedblog of relatedBlog) {
                    const newRelatedBlog: any = new BlogRelated();
                    newRelatedBlog.blogId = blogSave.id;
                    newRelatedBlog.relatedBlogId = relatedblog;
                    await this.blogRelatedService.create(newRelatedBlog);
                }
            }

        }

        if (blogSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated blog.',
                data: blogSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the blog.',
            };
            return response.status(400).send(errorResponse);
        }
    }
    // Delete Blog API
    /**
     * @api {delete} /api/blog/delete-blog/:id Delete Blog API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} blogId  blogId
     * @apiParamExample {json} Input
     * {
     * "blogId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Blog.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/blog/delete-blog/:id
     * @apiErrorExample {json} Delete Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-blog/:id')
    @Authorized(['admin', 'delete-blogs'])
    public async deleteBlog(@Param('id') blogId: number, @Res() response: any, @Req() request: any): Promise<any> {

        const dataId = await this.blogService.findOne({ where: { id: blogId } });
        if (dataId === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Please choose a blog that you want to delete. ',
            };
            return response.status(400).send(errorResponse);
        } else {
            await this.blogService.delete(dataId);
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted Blog',
            };
            return response.status(200).send(successResponse);
        }
    }
    // Delete Multiple Blog API
    /**
     * @api {post} /api/blog/delete-multiple-blog Delete Multiple Blog API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiParam {Number} blogId Blog Id
     * @apiParamExample {json} Input
     * {
     *   "BlogId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Blog.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/blog/delete-multiple-blog
     * @apiErrorExample {json} Delete multiple Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-multiple-blog')
    @Authorized()
    public async deleteMultipleBlog(@Body({ validate: true }) deleteBlog: DeleteBlog, @Res() response: any, @Req() request: any): Promise<any> {
        const blogData = deleteBlog.blogId.toString();
        const blog: any = blogData.split(',');
        const data: any = blog.map(async (id: any) => {
            const dataId = await this.blogService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid Blog Id.',
                };
                return response.status(400).send(errorResponse);
            } else {
                await this.blogService.delete(dataId);
            }
        });
        const deleteBlogs = await Promise.all(data);
        if (deleteBlogs) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted blog.',
            };
            return response.status(200).send(successResponse);
        }
    }

    // Blog Detail
    /**
     * @api {get} /api/blog/blog-detail Blog Detail API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} blogId Blog Id
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Blog detail",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/blog/blog-detail
     * @apiErrorExample {json} Blog Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/blog-detail')
    @Authorized()
    public async BlogDetail(@QueryParam('blogId') blogId: number, @Res() response: any): Promise<any> {
        const blog = await this.blogService.findOne({
            where: {
                id: blogId,
            },
        });
        if (!blog) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Blog Id',
            };
            return response.status(400).send(errorResponse);
        }
        const category = await this.categoryService.findOne({
            where: {
                categoryId: blog.categoryId,
            },
        });
        if (category) {
            blog.categoryName = category.name;
        }
        blog.blogRelated = await this.blogRelatedService.findAll({ where: { blogId: blog.id } }).then((val) => {
            const relatedBlog = val.map(async (value: any) => {
                const idBlog = value.relatedBlogId;
                const blogDetail = await this.blogService.findOne({
                    select: ['id', 'title', 'image', 'imagePath'],
                    where: { id: idBlog },
                });
                return (blogDetail);
            });
            const resultData = Promise.all(relatedBlog);
            return resultData;
        });
        const successResponse: any = {
            status: 1,
            message: 'Successfully got blog list',
            data: blog,
        };
        return response.status(200).send(successResponse);
    }

    // Blog Count API
    /**
     * @api {get} /api/blog/blog-count Blog Count API
     * @apiGroup Blog
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get blog count",
     *      "data":{},
     *      "status": "1"
     * }
     * @apiSampleRequest /api/blog/blog-count
     * @apiErrorExample {json} Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/blog-count')
    @Authorized()
    public async blogCount(@Res() response: any): Promise<any> {
        const blog: any = {};
        const select = [];
        const search = [];
        const WhereConditions = [];
        const allBlogCount = await this.blogService.list(0, 0, select, search, WhereConditions, 1);
        const whereConditionsActive = [
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const activeBlogCount = await this.blogService.list(0, 0, select, search, whereConditionsActive, 1);
        const whereConditionsInActive = [
            {
                name: 'isActive',
                op: 'where',
                value: 0,
            },
        ];
        const inActiveBlogCount = await this.blogService.list(0, 0, select, search, whereConditionsInActive, 1);
        blog.totalBlog = allBlogCount;
        blog.activeBlog = activeBlogCount;
        blog.inActiveBlog = inActiveBlogCount;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the blog count',
            data: blog,
        };
        return response.status(200).send(successResponse);
    }

    public async validate_slug($slug: string, $id: number = 0, $count: number = 0): Promise<string> {
        const slugCount = await this.blogService.checkSlug($slug, $id, $count);
        if (slugCount) {
            if (!$count) {
                $count = 1;
            } else {
                $count++;
            }
            return await this.validate_slug($slug, $id, $count);
        } else {
            if ($count > 0) {
                $slug = $slug + $count;
            }
            return $slug;
        }
    }
  // Add Blog New
    @Authorized()
    @Post('/add-new-blog')
    public async AddNewBlog(@Body({ validate: true }) newblogParam: CreateNewBlogRequest, @Req() request: any, @Res() response: any): Promise<any> {
        console.log("ad blog api","add api");
        const newBlog = new Blog();
        newBlog.title = newblogParam.title;
        newBlog.description = Buffer.from(newblogParam.description, 'base64').toString('ascii');
        newBlog.isActive = newblogParam.status;
        newBlog.category_name = newblogParam.category_name;
        newBlog.image = newblogParam.image;
        newBlog.banner_image = newblogParam.banner_image;
        console.log("blog data>>>",newBlog);
        const blogSave = await this.blogService.create(newBlog);
            if (blogSave) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created new blog.',
                    data: blogSave,
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Unable to create new blog. ',
                };
                return response.status(400).send(errorResponse);
            }        
    }
    //Update New Blog By id
    @Post('/update-new-blog')
    public async updateNewBlog(@Body({ validate: true }) newblogParam: CreateNewBlogRequest,@Res() response: any, @Req() request: any): Promise<any> {
        let id=newblogParam.id;
        console.log("id>>>",id);
        const blog: any = await this.blogService.findOne({
            where: {
                id: id,
            },
        });
        if (!blog) {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to edit blog,try again.',
            };
            return response.status(400).send(errorResponse);
        }
        blog.id = id;
        blog.title = newblogParam.title;
        blog.description = Buffer.from(newblogParam.description, 'base64').toString('ascii');
        blog.image = newblogParam.image;
        blog.isActive = newblogParam.status;
        blog.category_name = newblogParam.category_name;
        blog.banner_image = newblogParam.banner_image;
        const blogSave = await this.blogService.create(blog);
        if (blogSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated blog',
                data: blogSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to update the blog. ',
            };
            return response.status(400).send(errorResponse);
        }
    
    }

  //All Blog List
    @Get('/all-blog')
    public async GetAllBlog(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('category') category: string, @QueryParam('status') status: number, @Res() response: any): Promise<any> {
        const getBlogList: any = await this.blogService.blogList(limit, offset,category,status);
    if(getBlogList){
        const successResponse: any = {
            status: 1,
            message: 'Successfully get all blog.',
            data: getBlogList,
        };
        return response.status(200).send(successResponse);
    } else {
        const errorResponse: any = {
            status: 0,
            message: 'Unable to get the blog. ',
        };
        return response.status(400).send(errorResponse);
    }   
               
    }
  //Get blog By Id
    @Get('/get-blog-by-category')
    public async GetBlogByCategory(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('category') category: string, @Res() response: any): Promise<any> {
        const getBlogList: any = await this.blogService.getblogByCategory(limit, offset,category);
  
        if(getBlogList){
            const successResponse: any = {
                status: 1,
                message: 'Successfully get all blog by category.',
                data: getBlogList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to get the blog. ',
            };
            return response.status(400).send(errorResponse);
        }       
    }
 //Get Blog By Id  
 @Get('/get-blog-by-id')
    public async GetBlogById(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('id') id: string, @Res() response: any): Promise<any> {
        const getBlogList: any = await this.blogService.getblogById(limit, offset,id);
  
        if(getBlogList){
            const successResponse: any = {
                status: 1,
                message: 'Successfully get all blog by id.',
                data: getBlogList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to get the blog. ',
            };
            return response.status(400).send(errorResponse);
        }       
    }


    //Add Comment
    @Post('/add-new-comment')
    public async AddComment(@Body({ validate: true }) commentParam: CreateCommentRequest, @Req() request: any, @Res() response: any): Promise<any> {
        
        const newComment = new BlogComment();
        newComment.comment = commentParam.comment;
        newComment.blog_id = commentParam.blog_id;
        newComment.is_active = '0';
        const commentSave = await this.commentService.create(newComment);
      if (commentSave) {
        const successResponse: any = {
            status: 1,
            message: 'Successfully created new comment.',
            data: commentSave,
        };
        return response.status(200).send(successResponse);
    } else {
        const errorResponse: any = {
            status: 0,
            message: 'Unable to create new comment. ',
        };
        return response.status(400).send(errorResponse);
    }     
      
    }

    //get comment by blog id
    @Get('/get-comment-by-blog-id')
    public async GetCommentByBlogId(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('blogId') blogId: string, @Res() response: any): Promise<any> {
        const getCommentList: any = await this.commentService.getCommentByBlogId(limit, offset,blogId);
  
        if(getCommentList){
            const successResponse: any = {
                status: 1,
                message: 'Successfully get all comment by blog id.',
                data: getCommentList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to get the comment. ',
            };
            return response.status(400).send(errorResponse);
        }       
    }

  //get All comment
  @Get('/get-all-comment')
  public async GetAllComment(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number,@QueryParam('status') status: number, @Res() response: any): Promise<any> {
      const getCommentList: any = await this.commentService.getAllComment(limit, offset,status);
      if(getCommentList){
          const successResponse: any = {
              status: 1,
              message: 'Successfully get all comment.',
              data: getCommentList,
          };
          return response.status(200).send(successResponse);
      } else {
          const errorResponse: any = {
              status: 0,
              message: 'Unable to get the comment. ',
          };
          return response.status(400).send(errorResponse);
      }     
      
      
  }   
//Activate and inactivate comment
  @Post('/active-inactive-comment')
  public async CommentActiveInactive(@Req() request: any, @Res() response: any): Promise<any> {
      console.log("active inactive comment>>>",request);

      let id=request.body.id;
      let isActive=request.body.isActive;
      console.log("id>>>",id);
      const comment: any = await this.commentService.findOne({
          where: {
              id: id,
          },
      });
      console.log("comment id>>>",comment);
      if (!comment) {
          const errorResponse: any = {
              status: 0,
              message: 'Unable to update comment,try again.',
          };
          return response.status(400).send(errorResponse);
      }
      comment.id = id;
      comment.is_active=isActive
      const commentSave = await this.commentService.create(comment);
      if (commentSave) {
        const successResponse: any = {
            status: 1,
            message: 'Successfully updated comment',
            data: commentSave,
        };
        return response.status(200).send(successResponse);
    } else {
        const errorResponse: any = {
            status: 1,
            message: 'Unable to update the comment. ',
        };
        return response.status(400).send(errorResponse);
    }

  }


  //Get all blog for Store
  @Get('/all-store-blog')
  public async GetAllStoreBlog(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('categoryId') categoryId: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
    const footwear = await getManager().query(`SELECT * FROM blog where category_name='footwear' and is_active=1 order by created_date desc limit 4`);
    const garments = await getManager().query(`SELECT * FROM blog where category_name='garments' and is_active=1 order by created_date desc limit 4`);
    const accessories = await getManager().query(`SELECT * FROM blog where category_name='accessories' and is_active=1 order by created_date desc limit 4`);
    const footwearCount= await this.blogService.blogCount( {where: { category_name: "footwear",isActive:1 }});
    const garmentsCount= await this.blogService.blogCount( {where: { category_name: "garments",isActive:1 }});
    const accessoriesCount= await this.blogService.blogCount( {where: { category_name: "accessories",isActive:1 }});


    console.log("daat footwear",footwearCount);

    let finaldata={
        "footwear":footwear,
        "garments":garments,
        "accessories":accessories,
        "footwearCount":footwearCount,
        "garmentsCount":garmentsCount,
        "accessoriesCount":accessoriesCount



    }
  if(finaldata){
      const successResponse: any = {
          status: 1,
          message: 'Successfully get all blog.',
          data: finaldata,
      };
      return response.status(200).send(successResponse);
  } else {
      const errorResponse: any = {
          status: 0,
          message: 'Unable to get the blog. ',
      };
      return response.status(400).send(errorResponse);
  }   
             
//   }



}

  //Get latest blog 
  @Get('/get-latest-blog')
  public async GetLatestStoreBlog(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('categoryId') categoryId: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
    const latestBlog = await getManager().query(`SELECT * FROM blog where is_active=1 order by created_date desc limit 4`);
  
    let finaldata={
        "latestBlog":latestBlog,
    }
  if(finaldata){
      const successResponse: any = {
          status: 1,
          message: 'Successfully get latest all blog.',
          data: finaldata,
      };
      return response.status(200).send(successResponse);
  } else {
      const errorResponse: any = {
          status: 0,
          message: 'Unable to get the blog. ',
      };
      return response.status(400).send(errorResponse);
  }   
             
//   }



}

}
