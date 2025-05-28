import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts-repository';
import { Blog, BlogModelType } from '../../blogs/domain/blog.entity';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import {
  CreatePostDomainDto,
  CreatePostDto,
  UpdatePostDto,
} from '../dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private postRepository: PostsRepository,
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogModel.findOne({
      _id: dto.blogId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });
    await this.postRepository.save(post);
    return post._id.toString();
  }

  async createPostForBlog(
    blogId: string,
    dto: CreatePostDomainDto,
  ): Promise<string> {
    const blogExists = await this.blogModel.exists({
      _id: blogId,
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!blogExists) {
      throw new NotFoundException('Blog not found');
    }
    const blog = await this.blogModel.findOne({
      _id: blogId,
    });
    const post = this.postModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog!.name,
    });
    await this.postRepository.save(post);
    return post._id.toString();
  }

  async deletePost(id: string) {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postRepository.save(post);
  }
  async updatePost(id: string, dto: UpdatePostDto): Promise<string> {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postRepository.save(post);
    return post._id.toString();
  }
}
