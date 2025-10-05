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
    await test.step('Sign up new user', async () => {
      await signUpUser(page, user);
    });

    article = {
      title: 'My Test Article',
      description: 'Initial description',
      text: 'Initial article text content',
      tags: ['first-tag']
    };

    await test.step('Create a new article', async () => {
      articlePage = await createNewArticle(page, article);
    });

    editArticlePage = new EditArticlePage(page);

    await test.step('Open Edit Article page', async () => {
      await editArticlePage.openEditor();
    });
  });

  test('Edit article title', async ({ page }) => {
    await test.step('Update article title', async () => {
      await editArticlePage.updateTitle('Updated Title');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert updated title', async () => {
      await articlePage.assertArticleTitleIsVisible('Updated Title');
    });
  });

  test('Edit article description', async ({ page }) => {
    await test.step('Update description', async () => {
      await editArticlePage.updateDescription('Updated description');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert updated description', async () => {
      await expect(page.locator('p')).toContainText('Updated description');
    });
  });

  test('Edit article text', async ({ page }) => {
    await test.step('Update article text', async () => {
      await editArticlePage.updateText('Updated body text');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert updated text', async () => {
      await articlePage.assertArticleTextIsVisible('Updated body text');
    });
  });

  test('Add tag to article without tags', async ({ page }) => {
    await test.step('Remove existing tag', async () => {
      await editArticlePage.removeTag('first-tag');
    });
    await test.step('Add new tag', async () => {
      await editArticlePage.addTag('new-tag');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert new tag is visible', async () => {
      await expect(page.locator('.tag-list')).toContainText('new-tag');
    });
  });

  test('Add tag to article with existing tags', async ({ page }) => {
    await test.step('Add second tag', async () => {
      await editArticlePage.addTag('second-tag');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert second tag is visible', async () => {
      await expect(page.locator('.tag-list')).toContainText('second-tag');
    });
  });

  test('Remove a tag from article', async ({ page }) => {
    await test.step('Remove first tag', async () => {
      await editArticlePage.removeTag('first-tag');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert tag removed', async () => {
      await expect(page.locator('.tag-list')).not.toContainText('first-tag');
    });
  });

  test('Try to remove article title (show error)', async ({ page }) => {
    await test.step('Clear title', async () => {
      await editArticlePage.updateTitle('');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert title error', async () => {
      await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_TITLE);
    });
  });

  test('Try to remove article description (show error)', async ({ page }) => {
    await test.step('Clear description', async () => {
      await editArticlePage.updateDescription('');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert description error', async () => {
      await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_DESCRIPTION);
    });
  });

  test('Try to remove article text (show error)', async ({ page }) => {
    await test.step('Clear text', async () => {
      await editArticlePage.updateText('');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert text error', async () => {
      await editArticlePage.assertErrorMessageContainsText(ERROR_MESSAGES.MISSING_TEXT);
    });
  });

  test('Cancel edit and ensure original article remains unchanged', async ({ page }) => {
    await test.step('Update title temporarily', async () => {
      await editArticlePage.updateTitle('Temporary Title');
    });
    await test.step('Go back without publishing', async () => {
      await page.goBack();
    });
    await test.step('Assert original title is unchanged', async () => {
      await articlePage.assertArticleTitleIsVisible(article.title);
    });
  });

  test('Prevent adding duplicate tags', async ({ page }) => {
    await test.step('Add duplicate tag', async () => {
      await editArticlePage.addTag('first-tag');
    });
    await test.step('Publish changes', async () => {
      await editArticlePage.publishChanges();
    });
    await test.step('Assert tag only appears once', async () => {
      const tagCount = await page.locator('.tag-pill:has-text("first-tag")').count();
      expect(tagCount).toBe(1);
    });
  });
});
