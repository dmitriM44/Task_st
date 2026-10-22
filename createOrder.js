//ПРЕДМЕТНАЯ ОБЛАСТЬ
function calculateOrderTotal(items) {
  let total = 0;
  for (const i of items) total += i.price * i.qty;
  if (total > 10000) total *= 0.95;
  return total;
}

// АБСТРАКЦИЯ СОХРАНЕНИЯ
async function saveOrder(userId, total) {
  await db.query(
    "INSERT INTO orders (user_id, total) VALUES ($1, $2)",
    [userId, total]
  );
}

// АБСТРАКЦИЯ УВЕДОМЛЕНИЯ
async function notifyUser(email, message) {
  await smtp.send(email, message);
}

async function createOrder(req, res) {
  const body = JSON.parse(req.body);
  if (!body.items.length) return res.status(400).send("empty");
  // 1. Считаем сумму — через предметную область
  const total = calculateOrderTotal(body.items);
  // 2. Сохраняем — через абстракцию хранилища
  await saveOrder(req.user.id, total);
  // 3. Уведомляем — через абстракцию почты
  await notifyUser(req.user.email, "Заказ принят");
  res.status(201).send(JSON.stringify({ total }));
}