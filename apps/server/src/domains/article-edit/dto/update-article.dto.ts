export class UpdateArticleRequestDto {
  title: string;
  tags: string[];
}

export class UpdateArticleResponseDto {
  id: string;
  title: string;
  tags: string[];
}
