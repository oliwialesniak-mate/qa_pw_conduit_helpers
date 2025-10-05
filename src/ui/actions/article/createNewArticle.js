import { test } from '@playwright/test';
import { CreateArticlePage } from '../../pages/article/CreateArticlePage';
import { ViewArticlePage } from '../../pages/article/ViewArticlePage';

export async function createNewArticle(page, article) {
  let viewArticlePage;
  await test.step(`Create a new article: "${article.title}"`, async () => {
    const createArticlePage = new CreateArticlePage(page);
    viewArticlePage = new ViewArticlePage(page);

    await test.step('Navigate to New Article page', async () => {
      await page.getByRole('link', { name: 'New Article' }).click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Fill article title', async () => {
      await createArticlePage.fillTitleField(article.title);
    });

    await test.step('Fill article description', async () => {
      await createArticlePage.fillDescriptionField(article.description);
    });

    await test.step('Fill article text/body', async () => {
      await createArticlePage.fillTextField(article.text ?? article.body ?? '');
    });

    if (article.tags && article.tags.length > 0) {
      for (const tag of article.tags) {
        await test.step(`Add tag "${tag}"`, async () => {
          const tagsInput = createArticlePage.getTagsInput();
          await tagsInput.fill(tag);
          await tagsInput.press('Enter');
          await page.locator('.tag-pill', { hasText: tag }).waitFor({ state: 'visible' });
        });
      }
    }

    await test.step('Click Publish Article button', async () => {
      await createArticlePage.clickPublishArticleButton();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify article title is visible', async () => {
      await viewArticlePage.assertArticleTitleIsVisible(article.title);
    });
  });

  return viewArticlePage;
}
