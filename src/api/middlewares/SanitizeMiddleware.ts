import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })

export class SanitizeMiddleware implements ExpressMiddlewareInterface {
  public async use(req: any, res: any, next: any): Promise<void> {
    let data = req.body;
    const isValid = (input: any) => {
      if (input.includes("'")) { return false; }
      if (input.includes('"')) { return false; }
      if (input.includes('<')) { return false; }
      if (input.includes('>')) { return false; }
      if (input.includes('#')) { return false; }
      if (input.includes('$')) { return false; }
      if (input.includes('%')) { return false; }
      if (input.includes('^')) { return false; }
      if (input.includes('&')) { return false; }
      if (input.includes('*')) { return false; }
      return true;
    };
    const isValid2 = (name: any) => {
      if (name.includes('<')) { return false; }
      if (name.includes('>')) { return false; }
      if (name.includes('@')) { return false; }
      if (name.includes('$')) { return false; }
      if (name.includes('*')) { return false; }
      if (name.includes('^')) { return false; }
      return true;
    };
    const isValidColourCode = (input: any) => {
      if (input.includes("'")) { return false; }
      if (input.includes('"')) { return false; }
      if (input.includes('<')) { return false; }
      if (input.includes('>')) { return false; }
      if (input.includes('$')) { return false; }
      if (input.includes('%')) { return false; }
      if (input.includes('^')) { return false; }
      if (input.includes('&')) { return false; }
      if (input.includes('*')) { return false; }
      return true;
    };
    const isValidSymbol = (input: any) => {
      if (input.includes("'")) { return false; }
      if (input.includes('"')) { return false; }
      if (input.includes('<')) { return false; }
      if (input.includes('>')) { return false; }
      if (input.includes('%')) { return false; }
      if (input.includes('^')) { return false; }
      if (input.includes('*')) { return false; }
      return true;
    };
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'password' && key !== 'confirmPassword' && key !== 'newPassword' && key !== 'oldPassword' && key !== 'productDescription' && key !== 'description'
          && key !== 'metaTagDescription' && key !== 'widgetDescription' && key !== 'companyDescription' && key !== 'content' && key !== 'metaTagContent' && key!=='link' && key!=='productSizeColor' && key!=='address1' && key!=='address') {
          if (key === 'productName' || key === 'permission') {
            if (!isValid2(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'colorcode' || key === 'colorCode') {
            if (!isValidColourCode(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'symbolLeft' || key === 'symbolRight') {
            if (value !== undefined && value !== null) {
              if (!isValidSymbol(value)) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          } else {
            if (value !== undefined && value !== null) {
              if (!isValid(value.toString())) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          }
        }
      }
    }
    data = req.params;
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'password' && key !== 'confirmPassword' && key !== 'newPassword' && key !== 'oldPassword' && key !== 'productDescription' && key !== 'description'
          && key !== 'metaTagDescription' && key !== 'widgetDescription' && key !== 'companyDescription' && key !== 'content' && key !== 'metaTagContent' && key!=='link' && key!=='productSizeColor' && key!=='address1' && key!=='address') {
          if (key === 'productName' || key === 'permission') {
            if (!isValid2(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'colorcode' || key === 'colorCode') {
            if (!isValidColourCode(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'symbolLeft' || key === 'symbolRight') {
            if (value !== undefined && value !== null) {
              if (!isValidSymbol(value)) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          } else {
            if (value !== undefined && value !== null) {
              if (!isValid(value.toString())) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          }
        }
      }
    }
    data = req.query;
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'password' && key !== 'confirmPassword' && key !== 'newPassword' && key !== 'oldPassword' && key !== 'productDescription' && key !== 'description'
          && key !== 'metaTagDescription' && key !== 'widgetDescription' && key !== 'companyDescription' && key !== 'content' && key !== 'metaTagContent' && key!=='link' && key!=='productSizeColor' && key!=='address1' && key!=='address') {
          if (key === 'productName' || key === 'permission') {
            if (!isValid2(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'colorcode' || key === 'colorCode') {
            if (!isValidColourCode(value.toString())) {
              return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
            }
          } else if (key === 'symbolLeft' || key === 'symbolRight') {
            if (value !== undefined && value !== null) {
              if (!isValidSymbol(value)) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          } else {
            if (value !== undefined && value !== null) {
              if (!isValid(value.toString())) {
                return res.status(400).send({ status: 0, message: `Invalid character in ${key}` });
              }
            }
          }
        }
      }
    }
    next();
  }
}
