import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostsService } from '../application/posts.service';
import { CreatePostDomainDto, UpdatePostDto } from '../dto/posts.dto';
import { PostsViewDto } from '../dto/posts.view-dto';
import { GetPostsQueryParams } from './get.posts.query.params';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostsQueryRepository,
    private postService: PostsService,
  ) {}
  @Post()
  async createPost(@Body() body: CreatePostDomainDto): Promise<PostsViewDto> {
    const postId = await this.postService.createPost(body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }
  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAllPosts(query);
  }
  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostsViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(id);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postService.deletePost(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): Promise<PostsViewDto> {
    const postId = await this.postService.updatePost(id, body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
