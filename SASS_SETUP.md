# Setting up SASS

Your project is now configured to use SASS/SCSS.

## Project Structure

- `scss/styles.scss` - Your SASS source file
- `css/styles.css` - Compiled CSS (auto-generated, don't edit directly)

## To use SASS:

1. Install Node.js and npm from https://nodejs.org/

2. Install dependencies:
   ```
   npm install
   ```

3. Compile SCSS to CSS (one-time):
   ```
   npm run sass:build
   ```

4. Watch for changes and auto-compile:
   ```
   npm run sass
   ```

## Tips

- Edit only the files in the `scss/` folder
- The `css/` folder is auto-generated - don't edit files there directly
- Use SASS features like nesting, variables, and mixins in your `.scss` files
