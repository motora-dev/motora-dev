export class UpdateArticleCommand {
  constructor(
    public readonly articleId: string,
    public readonly title: string,
    public readonly tags: string[],
  ) {}
}
