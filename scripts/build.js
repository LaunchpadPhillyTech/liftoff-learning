// scripts/build.js
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const marked = require('marked');
const frontMatter = require('front-matter');

async function buildPresentations() {
    // Clear previous build
    await fs.emptyDir('./dist');

    // Copy shared resources
    await fs.copy('./presentations/shared', './dist/shared');

    // Find all presentations
    const presentations = glob.sync('./presentations/*/index.html');

    for (const presentationPath of presentations) {
        const presentationDir = path.dirname(presentationPath);
        const presentationName = path.basename(path.dirname(presentationPath));
        const outputDir = path.join('./dist', presentationName);

        // Create output directory
        await fs.ensureDir(outputDir);

        // Process markdown files
        const markdownFiles = glob.sync(path.join(presentationDir, 'slides/*.md'));
        for (const mdFile of markdownFiles) {
            const content = await fs.readFile(mdFile, 'utf-8');
            const { attributes, body } = frontMatter(content);
            
            // Process markdown with any custom transformations
            const processedContent = marked(body);
            
            // Save processed content
            const outputPath = path.join(
                outputDir, 
                'slides', 
                path.basename(mdFile, '.md') + '.html'
            );
            await fs.outputFile(outputPath, processedContent);
        }

        // Copy presentation-specific assets
        await fs.copy(
            path.join(presentationDir, 'assets'),
            path.join(outputDir, 'assets'),
            { overwrite: true }
        );

        // Process and copy index.html
        const indexContent = await fs.readFile(presentationPath, 'utf-8');
        // Add any necessary transformations to index.html
        await fs.outputFile(
            path.join(outputDir, 'index.html'),
            indexContent
        );
    }

    console.log('Build completed successfully!');
}

buildPresentations().catch(console.error);