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
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostsService } from '../application/posts.service';
import { CreatePostInputDto, UpdatePostDto } from '../dto/posts.dto';
import { PostsViewDto } from '../dto/posts.view-dto';
import { GetPostsQueryParams } from './get.posts.query.params';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { LikeToPostModel } from '../likes/like-model';
import { CurrentUser } from '../../../user-accounts/decarators/user-decorators';

@Controller('posts')
export class PostsController {
  constructor(
    private postQueryRepository: PostsQueryRepository,
    private postService: PostsService,
  ) {}
  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostsViewDto> {
    console.log('--- Controller: createPost called ---');
    console.log('Body:', body);
    const postId = await this.postService.createPost(body);
    console.log('Created post with ID:', postId);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @CurrentUser() userId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAllPosts(query, userId);
  }
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @CurrentUser() userId?: string,
  ): Promise<PostsViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(id, userId);
  }
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.postService.deletePost(id);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): Promise<PostsViewDto> {
    const postId = await this.postService.updatePost(id, body);
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async createLikeToPost(
    @Param('id') postId: string,
    @Body() { likeStatus }: LikeToPostModel,
    @CurrentUser() userId: string,
    @CurrentUser('login') userLogin: string,
  ): Promise<void> {
    await this.postService.updateLikeStatus(
      postId,
      userId,
      userLogin,
      likeStatus,
    );
  }
}
