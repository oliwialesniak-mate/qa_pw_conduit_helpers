import { test, expect } from '@playwright/test';
import { generateNewUserData } from '../../src/utils/generateNewUserData';
import { signUpUser } from '../../src/ui/actions/auth/signUpUser';
import { createNewArticle } from '../../src/ui/actions/article/createNewArticle';
import { EditArticlePage } from '../../src/ui/pages/article/EditArticlePage';
import { ViewArticlePage } from '../../src/ui/pages/article/ViewArticlePage';
import { ERROR_MESSAGES } from '../../src/ui/constants/articleErrorMessages';

test.describe('📝 Edit Article Feature', () => {
  let article;
  let editArticlePage;
  let articlePage;

  test.beforeEach(async ({ page }) => {
    const user = generateNewUserData();
    await signUpUser(page, user);

    article = {
      title: 'My Test Article',
      description: 'Initial description',
      text: 'Initial article text content',
      tags: ['first-tag']
    };
    await createNewArticle(page, article);

    editArticlePage = new EditArticlePage(page);
    articlePage = new ViewArticlePage(page); // ✅ Use the class you imported

    await editArticlePage.openEditor();
  });

  test('Edit article title', async ({ page }) => {
    await editArticlePage.updateTitle('Updated Title');
    await editArticlePage.publishChanges();
    await articlePage.assertArticleTitleIsVisible('Updated Title'); // ✅ Use class method
  });

  test('Edit article description', async ({ page }) => {
    await editArticlePage.updateDescription('Updated description');
    await editArticlePage.publishChanges();
    await expect(page.locator('p')).toContainText('Updated description'); // description locator not in class
  });

  test('Edit article text', async ({ page }) => {
    await editArticlePage.updateText('Updated body text');
    await editArticlePage.publishChanges();
    await articlePage.assertArticleTextIsVisible('Updated body text'); // ✅ Use class method
  });

  test('Add tag to article without tags', async ({ page }) => {
    await editArticlePage.removeTag('first-tag');
    await editArticlePage.addTag('new-tag');
    await editArticlePage.publishChanges();
    await expect(page.locator('.tag-list')).toContainText('new-tag');
  });

  test('Add tag to article with existing tags', async ({ page }) => {
    await editArticlePage.addTag('second-tag');
    await editArticlePage.publishChanges();
    await expect(page.locator('.tag-list')).toContainText('second-tag');
  });

  test('Remove a tag from article', async ({ page }) => {
    await editArticlePage.removeTag('first-tag');
    await editArticlePage.publishChanges();
    await expect(page.locator('.tag-list')).not.toContainText('first-tag');
  });

  test('Try to remove article title (show error)', async ({ page }) => {
    await editArticlePage.updateTitle('');
    await editArticlePage.publishChanges();
    await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_TITLE);
  });

  test('Try to remove article description (show error)', async ({ page }) => {
    await editArticlePage.updateDescription('');
    await editArticlePage.publishChanges();
    await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_DESCRIPTION);
  });

  test('Try to remove article text (show error)', async ({ page }) => {
    await editArticlePage.updateText('');
    await editArticlePage.publishChanges();
    await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_TEXT);
  });

  test('Cancel edit and ensure original article remains unchanged', async ({ page }) => {
    await editArticlePage.updateTitle('Temporary Title');
    await page.goBack();
    await articlePage.assertArticleTitleIsVisible(article.title); // ✅ Use class method
  });

  test('Prevent adding duplicate tags', async ({ page }) => {
    await editArticlePage.addTag('first-tag');
    await editArticlePage.publishChanges();
    const tagCount = await page.locator('.tag-pill:has-text("first-tag")').count();
    expect(tagCount).toBe(1);
  });
});
