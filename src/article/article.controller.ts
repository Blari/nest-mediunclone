import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/decorators/user.decorator';
import { CreateArticleDto } from './dto/create.article.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);

    if (article) {
      return this.articleService.buildArticleResponse(article);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }
}
