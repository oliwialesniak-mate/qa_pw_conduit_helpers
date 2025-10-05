import { test, expect } from '@playwright/test';
import { generateNewUserData } from '../../src/utils/generateNewUserData';
import { signUpUser } from '../../src/ui/actions/auth/signUpUser';
import { createNewArticle } from '../../src/ui/actions/article/createNewArticle';
import { EditArticlePage } from '../../src/ui/pages/article/EditArticlePage';
import { ArticlePage } from '../../src/ui/pages/article/CreateArticlePage';
import { ERROR_MESSAGES } from '../../src/ui/constants/articleErrorMessages';

test.describe('📝 Edit Article Feature', () => {
  let article;
  let editArticlePage;
  let articlePage;

  test.beforeEach(async ({ page }) => {
    // 1️⃣ Register and sign in a new user
    const user = generateNewUserData();
    await signUpUser(page, user);

    // 2️⃣ Create a new article
    article = {
      title: 'My Test Article',
      description: 'Initial description',
      text: 'Initial article text content',
      tags: ['first-tag']
    };
    await createNewArticle(page, article);

    // 3️⃣ Initialize pages
    editArticlePage = new EditArticlePage(page);
    articlePage = new ViewArticlePage(page);

    // 4️⃣ Open the Edit Article page
    await editArticlePage.openEditor();
  });

  // ---------------------------- TESTS ----------------------------

  test('Edit article title', async ({ page }) => {
    await editArticlePage.updateTitle('Updated Title');
    await editArticlePage.publishChanges();
    await expect(articlePage.articleTitle).toHaveText('Updated Title');
  });

  test('Edit article description', async ({ page }) => {
    await editArticlePage.updateDescription('Updated description');
    await editArticlePage.publishChanges();
    await expect(articlePage.articleDescription).toContainText('Updated description');
  });

  test('Edit article text', async ({ page }) => {
    await editArticlePage.updateText('Updated body text');
    await editArticlePage.publishChanges();
    await expect(articlePage.articleBody).toContainText('Updated body text');
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

  // ---------------------- EXTRA USEFUL TESTS ----------------------

  test('Cancel edit and ensure original article remains unchanged', async ({ page }) => {
    await editArticlePage.updateTitle('Temporary Title');
    // Instead of publishing, go back
    await page.goBack();
    await expect(articlePage.articleTitle).toHaveText(article.title);
  });

  test('Prevent adding duplicate tags', async ({ page }) => {
    await editArticlePage.addTag('first-tag');
    await editArticlePage.publishChanges();
    // Duplicate should not appear twice
    const tagCount = await page.locator('.tag-pill:has-text("first-tag")').count();
    expect(tagCount).toBe(1);
  });
});
