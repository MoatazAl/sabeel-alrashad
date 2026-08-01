import { readFile } from "node:fs/promises";
import { Node, Project, SyntaxKind } from "ts-morph";

const payloadPath = process.argv[2];
if (!payloadPath) throw new Error("Missing payload path");

const payload = JSON.parse(await readFile(payloadPath, "utf8"));
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFile = project.addSourceFileAtPath(payload.libraryFile ?? "data/library.ts");
const rawBooks = sourceFile.getVariableDeclarationOrThrow("rawBooks");
const books = rawBooks.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

function stringValue(property) {
  if (!property || !Node.isPropertyAssignment(property)) return null;
  const value = property.getInitializer();
  if (!value) return null;
  if (Node.isStringLiteral(value) || Node.isNoSubstitutionTemplateLiteral(value)) {
    return value.getLiteralText();
  }
  return null;
}

const course = books.getElements().find((element) => {
  if (!Node.isObjectLiteralExpression(element)) return false;

  const slugProperty = element.getProperty("slug");
  if (!slugProperty || !Node.isPropertyAssignment(slugProperty)) return false;

  const literalSlug = stringValue(slugProperty);
  const slugExpression = slugProperty.getInitializer()?.getText();

  return (
    literalSlug === payload.slug ||
    Boolean(
      payload.slugReference &&
      slugExpression === payload.slugReference
    )
  );
});

if (!course || !Node.isObjectLiteralExpression(course)) {
  throw new Error(`Course not found: ${payload.slug}`);
}

const updatedAt = course.getProperty("updatedAt");
if (updatedAt && Node.isPropertyAssignment(updatedAt)) {
  updatedAt.setInitializer(JSON.stringify(payload.updatedAt));
} else {
  course.insertPropertyAssignment(0, {
    name: "updatedAt",
    initializer: JSON.stringify(payload.updatedAt),
  });
}

if (payload.lesson) {
  const lessonsProperty = course.getProperty("lessons");
  if (!lessonsProperty || !Node.isPropertyAssignment(lessonsProperty)) {
    throw new Error(`Lessons array not found for ${payload.slug}`);
  }
  const lessons = lessonsProperty.getInitializerIfKindOrThrow(
    SyntaxKind.ArrayLiteralExpression
  );

  const duplicate = lessons.getElements().some((element) => {
    if (!Node.isObjectLiteralExpression(element)) return false;
    const id = stringValue(element.getProperty("id"));
    const numberProperty = element.getProperty("number");
    const numberValue =
      numberProperty && Node.isPropertyAssignment(numberProperty)
        ? Number(numberProperty.getInitializer()?.getText())
        : NaN;
    return id === payload.lesson.id || numberValue === Number(payload.lesson.number);
  });

  if (duplicate) throw new Error(`Lesson already exists: ${payload.lesson.number}`);

  lessons.addElement(`{
    id: ${JSON.stringify(payload.lesson.id)},
    number: ${Number(payload.lesson.number)},
    title: ${JSON.stringify(payload.lesson.title)},
    audioUrl: ${JSON.stringify(payload.lesson.audioUrl)},
    image: ${JSON.stringify(payload.lesson.image)},
    coverImage: ${JSON.stringify(payload.lesson.image)},
    startAt: 0,
  }`);
}

await sourceFile.save();
