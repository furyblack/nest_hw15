import { PostDocument } from '../domain/post.entity';

export enum MyStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
  static mapToView(
    post: PostDocument,
    myStatus: MyStatus = MyStatus.None,
  ): PostsViewDto {
    const dto = new PostsViewDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: myStatus,
      newestLikes: post.newestLikes,
    };
    return dto;
  }
}
