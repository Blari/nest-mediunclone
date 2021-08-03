import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create.article.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponseInterface';
import { log } from 'util';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = ArticleService.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug: slug },
    });

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id != currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug: slug },
    });

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id != currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    if (article.title != updateArticleDto.title) {
      article.slug = ArticleService.getSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private static getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
